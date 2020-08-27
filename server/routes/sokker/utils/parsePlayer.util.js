const jsdom = require("jsdom");
const { JSDOM } = jsdom;


module.exports = function({ body, teamID, pid }) {
    const dom = new JSDOM(body);
    const document = dom.window.document;

    const skills = document.querySelector('.table-skills') ?
        document.querySelector('.table-skills').textContent.split(']')
        :
        null;

    return {
        pid: teamID ?
            `https://sokker.org/player/PID/${document.querySelector(".playersList.row div").textContent}`
            :
            `https://sokker.org/player/PID/${pid}`,
        name: teamID ?
            document.querySelector(".h5.title-block-2 a").textContent
            :
            document.querySelector(".h5.title-block-1 a").textContent,

        age: teamID ?
            +document.querySelector(".h5.title-block-2").textContent.match(/\d+/)[0]
            :
            +document.querySelector(".h5.title-block-1 strong").textContent,

        club: teamID ?
            `https://sokker.org/${teamID}`
            :
            `https://sokker.org/${document.querySelector(".media-body .strong").getAttribute('href')}`,

        country: teamID ? '' : document.querySelectorAll(".media-body .strong")[1].textContent,

        price: teamID ?
            document.querySelector('.small strong').textContent
            :
            document.querySelectorAll(".media-body li")[1].querySelector('span').textContent,

        form: teamID ?
            +document.querySelectorAll(".small strong")[2].querySelector('.skillNameNumber').textContent.match(/\d/)[0]
            :
            +document.querySelectorAll(".media-body li")[3].querySelector('span').textContent.match(/\d/)[0],

        ...!skills && { '[skills]': '[is hidden]' },
        ...skills && {
            stamina: +skills[0].match(/\d/)[0],
            keeper: +skills[1].match(/\d/)[0],
            pace: +skills[2].match(/\d/)[0],
            defender: +skills[3].match(/\d/)[0],
            technique: +skills[4].match(/\d/)[0],
            playmaker: +skills[5].match(/\d/)[0],
            passing: +skills[6].match(/\d/)[0],
            striker: +skills[7].match(/\d/)[0]
        }
    }
}