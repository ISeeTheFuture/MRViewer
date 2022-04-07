const moment = require('moment')

const createElement = require('./CreateElement');

class MergeRequestList {
    createList(items) {
        console.log(items);
        const old_ol = document.getElementById('mergeRequestList')
        if (old_ol != null) {
            old_ol.remove()
        }
        const orderedList = createElement('ol');
        orderedList.setAttribute('id', 'mergeRequestList')
        items.forEach(({author, web_url, title, created_at, source_branch, upvotes, work_in_progress}) => {
            const projectName = web_url.toString().split("/")[4];
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <details>
                    <summary>
                        <a href="${web_url}" target="_blank" class="button" aria-label="Go to this mr in the external browser">MR링크</a>
                        <span>
                            <span style="font-weight:bold"> ${title} </span> <span class="author-name">by ${author.name}</span> at <time>${moment(created_at).format('DD-MM-YYYY HH:mm')}</time> (created <time datetime="${created_at}">${(moment(created_at).fromNow())}</time>)
                        </span>      
                    </summary>
                    <p>project : ${projectName}</p>
                    <p>branch : ${source_branch}</p>
                    <p>upvotes : ${upvotes}</p>
                    <p>WIP : ${work_in_progress}</p>}
                </details>
            `;
            orderedList.appendChild(listItem);
        });
        this.open
    }

    redirectToExternalBrowser() {
        document.addEventListener('click', e => {
            if (e.target.tagName === 'A' && e.target.href.startsWith('http')) {
                e.preventDefault();
                shell.openExternal(e.target.href);
            }
        });
    }
}

module.exports = MergeRequestList;