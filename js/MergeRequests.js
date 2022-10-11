const axios = require('axios');

const LoadingBar = require('./LoadingBar');
const StoredToken = require('./StoredToken')
const MergeRequestList = require('./MergeRequestList')

const mergeRequestList = new MergeRequestList();
const GROUP_ID = 88
// const MEMBERS = ["lauree", "Seoung91", "edlee", "extramilejin"]
const AWARD_REGEX = /award-control btn has-tooltip js-emoji-btn user-authored js-user-authored" data-placement="bottom" data-title="([^"]+)"/g // 정규식 : https://curryyou.tistory.com/234

// mr_content = {
//     title, desc, author, author_url, assignee, assignee_url, created_at, reviewers, upvotes, url, unresolved_count, total_count, valid, mergable, branch, turn
// };
// mr_list = new Array();

class MergeRequests {

    constructor(token) {
        this.token = token;
        this.checkAuth();
        this.refreshCycle = setInterval(this.refresh, 5000); // 테스트로 5초로 설정. 1분으로 변경할 것
    }

    axiosConfig(url) {
        return axios.get(url, {
            headers : {'Private-Token' : this.token}
        });
    }

    isLatestRecord() { // 5분 내 라면 latest
        const MRListTimeStr = localStorage.getItem('MRListTime');
        if(!MRListTimeStr) {
            return false;
        }
        const MRListTime = JSON.parse(MRListTimeStr);

        const latestRef = 10000 // 테스트로 일단 10초로 설정해 확인
        if(Date.now() - latestRef > MRListTime) {
            return false;
        }
        return true;
    }

    refresh() {
        console.log('no refresh');
        if(this.isLatestRecord()) {
            console.log('no refresh');
            return;
        }
        console.log('refresh');
        this.axiosConfig('https://gitlab.synap.co.kr/api/v4/users?active=true&per_page=200').then(() => {
            this.getData();
        })
        .catch(e => {
            console.log(e);
        })
    }

    checkAuth() {
        LoadingBar.show();
        this.axiosConfig('https://gitlab.synap.co.kr/api/v4/users?active=true&per_page=200').then(() => { // https://grepper.tistory.com/72
            document.getElementById('login-form').style.display = 'none';
            this.getData();
        })
        .catch(e => {
            LoadingBar.hide();
            alert('Login Failure');
            console.log(e);
        })
    }

    getData() {
        const mrPromise = [];
        // var mrPromiseLen = -1;
        // var cnt = 0;

        // this.axiosConfig('https://gitlab.synap.co.kr/api/v4/merge_requests?scope=all&state=opened&per_page=200')
        this.axiosConfig(`https://gitlab.synap.co.kr/api/v4/groups/${GROUP_ID}/projects`) // https://elvanov.com/2597
        .then(({data}) => {
            const storedToken = new StoredToken();
            storedToken.getToken(this.token);
            
            const group_projects = data;
            group_projects.forEach(({_links}) => {
                this.axiosConfig(`${_links.merge_requests}`)
                .then(({data}) => {
                    data.forEach((mr) => {
                        if (mr.state == "merged" ) {
                            mrPromise.push(mr);
                            // const upvotes = this.get_thumb_list(mr.web_url, this.token);
                            // if (upvotes != null) {
                            //     console.log(upvotes)
                            // }
                            // console.log(this.get_thumb_reviewer(upvotes))
                            // cnt++;
                        }
                    })
                    mergeRequestList.createList(mrPromise);
                    LoadingBar.hide();
                    localStorage.setItem('MRList', JSON.stringify(mrPromise)); // localStorage에 배열을 그냥 넣을 수는 없고, json 형식으로 변환해야 함
                    localStorage.setItem('MRListTime', JSON.stringify(new Date())); // https://hianna.tistory.com/698
                    // var output = localStorage.getItem('MRList'); // 동작 테스트
                    // var arrOutput = JSON.parse(output);
                    // console.log(arrOutput);
                })
            });
            // projectPromise.forEach((data) => {
            //     console.log(data);
            //     get_thumb_list(data.web_url);
            // })
        })
        .catch(e => {
            console.log(e);
            LoadingBar.hide();
            alert('error!');
            document.getElementById('login-form').style.display = 'block';
        });
    }

    isEnd(before, now) {
        console.log(before);
        console.log(now);
        setTimeout(500);
        if(before != now) {
            return false;
        }
        return true;
    }


    get_thumb_list(url, token) {
        this.request_thumb_list(url, token).then((response) => {
            console.log(response);
            return response;
        }).catch((reject) => {
            // console.log(reject);
        })
    }

    request_thumb_list(url, token) {
        return new Promise(function(resolve, reject) {
            var request = new XMLHttpRequest();
            request.open("GET", url, true);
            request.setRequestHeader("Content-Type", "text/xml");
            request.setRequestHeader('Private-Token', token)
            request.onreadystatechange = function() {
                if (request.readyState == 4) {
                    var thumb_str = request.responseText.match(AWARD_REGEX);
                    if (thumb_str != null) {
                        var ret = thumb_str.toString().slice(111, thumb_str.toString().length - 1).replace('and ', '').split(', ');
                        // console.log(ret)
                        resolve(ret);
                    } else {
                        resolve([]);
                    }
                } else {
                    reject(null);
                }
            }
            request.send(null);
        });
    }

    // get_thumb_reviewer(upvotes) {
    //     console.log(upvotes)
    //     return MEMBERS.filter(it => upvotes.includes(it)).length
    // }
}

module.exports = MergeRequests;