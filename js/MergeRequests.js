const axios = require('axios');

const LoadingBar = require('./LoadingBar');
const StoredToken = require('./StoredToken')
const MergeRequestList = require('./MergeRequestList')

const mergeRequestList = new MergeRequestList();
const GROUP_ID = 88
const MEMBERS = ["lauree", "Seoung91", "sungali", "edlee"]
const AWARD_REGEX = /award-control btn has-tooltip js-emoji-btn user-authored js-user-authored" data-placement="bottom" data-title="([^"]+)"/g // 정규식 : https://curryyou.tistory.com/234

// mr_content = {
//     title, desc, author, author_url, assignee, assignee_url, created_at, reviewers, upvotes, url, unresolved_count, total_count, valid, mergable, branch, turn
// };
// mr_list = new Array();

class MergeRequests {

    constructor(token) {
        this.token = token;
        this.checkAuth();
    }

    axiosConfig(url) {
        return axios.get(url, {
            headers : {'Private-Token' : this.token}
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
        // const approvalPromises = [];
        const mrPromise = [];
        // this.axiosConfig('https://gitlab.synap.co.kr/api/v4/merge_requests?scope=all&state=opened&per_page=200')
        this.axiosConfig(`https://gitlab.synap.co.kr/api/v4/groups/${GROUP_ID}/projects`)
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
                                    const upvotes = this.get_thumb_list(mr.web_url, this.token);
                                    if (upvotes != null) {
                                        console.log(upvotes)
                                    }
                                    // console.log(this.get_thumb_reviewer(upvotes))
                                }
                            })
                        });
                });

                // console.log(projectPromise);

                // projectPromise.forEach((data) => {
                //     console.log(data);
                //     get_thumb_list(data.web_url);
                // })

                // const data_No_Approvals = data;
                // data_No_Approvals.forEach(({project_id, iid}) => {
                //     const promise = this.axiosConfig(`https://gitlab.synap.co.kr/api/v4/projects/${project_id}/merge_requests/${iid}`);
                //     approvalPromises.push(promise);
                // });

                // axios.all(approvalPromises)
                //     .then(response => {
                //         return response.map(({data}, index) => {
                //             data_No_Approvals[index]['approvalsInfo'] = data;
                //             return data_No_Approvals[index];
                //         });
                //     })
                //     .then(data_With_Approvals => {
                //         data_With_Approvals.forEach(({project_id}) => {
                //             const promise = this.axiosConfig(`https://gitlab.synap.co.kr/api/v4/projects/${project_id}/`);
                //             projectPromise.push(promise);
                //         });

                //         axios.all(projectPromise)
                //             .then(response => {
                //                 return response.map(({data}, index) => {
                //                     data_With_Approvals[index]['projectInfo'] = data;
                //                     return data_With_Approvals[index];
                //                 });
                //             })
                //             .then(data_With_Project_Approvals => {
                //                 mergeRequestList.createList(data_With_Project_Approvals);
                //                 LoadingBar.hide();
                //             });
                //     })
            })
            .catch(e => {
                console.log(e);
                LoadingBar.hide();
                alert('error!')
                document.getElementById('login-form').style.display = 'block';
            });
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