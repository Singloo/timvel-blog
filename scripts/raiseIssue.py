#!/usr/bin/python3
import xml.etree.ElementTree as etree
import requests
import json
import hashlib,os

api_user='Singloo'  #github用户名
api_token=os.environ.get('GITHUB_TOKEN') #申请的github访问口令

repo='https://github.com/Singloo/blog_gitalk'  #存储issue的repo
endpoint='https://blog.timvel.com/atom.xml'   #网站+/atom.xml

ssion=requests.session()
result=ssion.get(url=endpoint,verify=False)
result.encoding='utf-8' #修复中文乱码问题

def md5(s):
    hash = hashlib.md5()
    hash.update(s.encode('utf8'))
    return hash.hexdigest()

root = etree.fromstring(result.text)
all_entrys=root.findall('{http://www.w3.org/2005/Atom}entry')

headers = {
    "Authorization" : "token {}".format(api_token),
    "Accept": "application/vnd.github.v3+json"
}

for i in range(len(all_entrys)):
    _title=all_entrys[i].find('{http://www.w3.org/2005/Atom}title').text
    _url=all_entrys[i].find('{http://www.w3.org/2005/Atom}id').text
    # 从"https://lonbaw.github.io/post/test/" 中截取 "/post/test/"
    label_id=md5(_url[24:])
    data = {
        "title": _title,
        "labels": ['Gitalk',label_id],
        "body": _url
    }
    _get_issue=ssion.get(url='https://api.github.com/repos/{}/{}/issues?labels=Gitalk,{}'.format(api_user,repo,label_id),verify=False)

    if not _get_issue.json():
        print(f'post 《 {_title} 》是新发布的文章，开始创建issue！')
        _result=ssion.post(url='https://api.github.com/repos/{}/{}/issues'.format(api_user,repo),headers=headers,data=json.dumps(data),verify=False)
        if _result.status_code==201:
            print(f'post 《 {_title} 》create issue success !')
        else:
            print(f'post 《 {_title} 》create issue failed!!!,reson: {_result.text}') 
        continue       
    print(f'post 《 {_title} 》是旧文章')
ssion.close()

