const axios = require('axios');

const LoadingBar = require('./LoadingBar');
const StoredToken = require('./StoredToken')
const MergeRequestList = require('./MergeRequestList')

const mergeRequestList = new MergeRequestList();

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
    }

    getData() {
        const approvalPromises = [];
        const projectPromise = [];
        this.axiosConfig('https://gitlab.synap.co.kr/api/v4/merge_requests?scope=all&state=opened&per_page=200')
            .then(({data}) => {
                const storedToken = new StoredToken();
                storedToken.getToken(this.token);

                const data_No_Approvals = data;
                data_No_Approvals.forEach(({project_id, iid}) => {
                    const promise = this.axiosConfig(`https://gitlab.synap.co.kr/api/v4/projects/${project_id}/merge_requests/${iid}`);
                    console.log('___________________________________________');
                    console.log(promise);
                    console.log('___________________________________________');
                    approvalPromises.push(promise);
                });

                axios.all(approvalPromises)
                    .then(response => {
                        return response.map(({data}, index) => {
                            data_No_Approvals[index]['approvalsInfo'] = data;
                            return data_No_Approvals[index];
                        });
                    })
                    .then(data_With_Approvals => {
                        data_With_Approvals.forEach(({project_id}) => {
                            const promise = this.axiosConfig(`https://gitlab.synap.co.kr/api/v4/projects/${project_id}/`);
                            projectPromise.push(promise);
                        });

                        axios.all(projectPromise)
                            .then(response => {
                                return response.map(({data}, index) => {
                                    data_With_Approvals[index]['projectInfo'] = data;
                                    return data_With_Approvals[index];
                                });
                            })
                            .then(data_With_Project_Approvals => {
                                mergeRequestList.createList(data_With_Project_Approvals);
                                LoadingBar.hide();
                            });
                    })
            })
            .catch(e => {
                console.log(e);
                LoadingBar.hide();
                alert('error!')
                document.getElementById('login-form').style.display = 'block';
            });
    }
}

module.exports = MergeRequests;