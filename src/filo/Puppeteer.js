const puppeteer = require('puppeteer');
const { Cluster } = require('puppeteer-cluster');
const homedir = require('os').homedir();


require('events').EventEmitter.defaultMaxListeners = 30;

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

(async () => {

    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_BROWSER,
        maxConcurrency: 50,
    });

    const test = async () => {

        const user = process.argv[2];
        const pass = process.argv[3];
        const smis = process.argv[4];
        const nrinreg = process.argv[5];



        const browser = await puppeteer.launch({ headless: false, defaultViewport: null, args: ['--start-fullscreen'] }); // you can also use '--start-fullscreen']});
        const page = await browser.newPage();
        //await page.setViewport({width: 1200, height: 900});
        await page._client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: `${homedir}/Downloads/Fisiere-MySmis/` + smis + '/' + nrinreg }).catch(e => { });
        await page.goto('https://aplicatii2014.smis.fonduri-ue.ro/smis2014app/').catch(e => { });
        await delay(5000);
        // await page.waitFor(3000);

        //scriere credentiale pt elementele de tip HTML user&parola
        await page.type('#j_idt38 > .step-content > .step-pane > .col-md-12 > .form-group > input[name="j_idt38:utilizator"]', user).catch(e => { });
        await delay(3000);
        await page.type('#j_idt38 > .step-content > .step-pane > .col-md-12 > .form-group > input[name="j_idt38:pass"]', pass).catch(e => { });
        await delay(3000);
        page.click('#j_idt38 > .actions > a').catch(e => { });

        await delay(3000);

        page.click('#idPanelGroup > #headerPanel > div > #j_idt18 > tbody > tr > #topMenuCell > #j_idt22').catch(e => { });
        await delay(4000);
        await page.type('#dialogCereriFinantare > .ui-dialog-content > #formCereriFinantare > table > tbody > tr > td > input[id="formCereriFinantare:idSmisAll"]', smis).catch(e => { });
        await delay(3000);
        page.click('#dialogCereriFinantare > .ui-dialog-content > #formCereriFinantare > table > tbody > tr > td > a[id="formCereriFinantare:commandBtnSearch"]').catch(e => { });
        await delay(3000);
        page.click('span.ui-chkbox-icon.ui-icon.ui-icon-blank.ui-c').catch(e => { });
        await delay(3000);
        await page.type('#dialogAcordConfidentialitate > .ui-dialog-content > #formAcordConfidentialitate > div[id="formAcordConfidentialitate:j_idt167"] > .ui-scrollpanel-container > .ui-scrollpanel-content > .col-md-12 > .row > .col-md-3 > input[id="formAcordConfidentialitate:CNP"]', pass).catch(e => { });
        await delay(3000);
        page.click('#dialogAcordConfidentialitate > .ui-dialog-content > #formAcordConfidentialitate > div[id="formAcordConfidentialitate:j_idt167"] > .ui-scrollpanel-container > .ui-scrollpanel-content > .col-md-12 > .row > a[id="formAcordConfidentialitate:btnConfirmContent"]').catch(e => { });
        await delay(3000);
        page.click('#dialogCereriFinantare > .ui-dialog-content > #formCereriFinantare > div > div > a > .ui-icon-seek-end').catch(e => { });
        await delay(4000);

        const doc_details = await page.evaluate(() => {
            //Extract each doc's basic details
            let table = document.querySelector('#dialogCereriFinantare > .ui-dialog-content > #formCereriFinantare > div[id="formCereriFinantare:tableCereriFinantare"] > .ui-datatable-tablewrapper > table > tbody');
            let doc_panels = Array.from(table.children);
            // Loop through each doc and get their details 
            let doc_info = doc_panels.map(doc_panel => {
                let versiune = doc_panel.querySelector("tr > td:nth-child(3)").textContent;
                let contractare = doc_panel.querySelector("tr > td:nth-child(4)").textContent;

                return { versiune, contractare };
            });


            return doc_info;
        });


        doc_details.sort((a, b) => (parseInt(a.versiune) < parseInt(b.versiune) ? 1 : -1));
        let res = [];
        res = doc_details.filter(a => a.contractare.length > 0);

        await delay(3000);
        /**
         * Get first elem from a array
         * // [...res].shift()
         */
        const [first] = res;
        /**
         * If no element exist 
         */
        //console.log(first);

        if (first === null || first === undefined) {

            page.click('#dialogCereriFinantare > .ui-dialog-content > #formCereriFinantare > div > div > a > .ui-icon-seek-prev').catch(e => { });
            await delay(3000);

            const doc_details = await page.evaluate(() => {
                //Extract each doc's basic details
                let table = document.querySelector('#dialogCereriFinantare > .ui-dialog-content > #formCereriFinantare > div[id="formCereriFinantare:tableCereriFinantare"] > .ui-datatable-tablewrapper > table > tbody');
                let doc_panels = Array.from(table.children);
                // Loop through each doc and get their details 
                let doc_info = doc_panels.map(doc_panel => {
                    let versiune = doc_panel.querySelector("tr > td:nth-child(3)").textContent;
                    let contractare = doc_panel.querySelector("tr > td:nth-child(4)").textContent;

                    return { versiune, contractare };
                });


                return doc_info;
            });

            await delay(3000);

            doc_details.sort((a, b) => (parseInt(a.versiune) < parseInt(b.versiune) ? 1 : -1));
            let res = [];
            res = doc_details.filter(a => a.contractare.length > 0);

            const [first] = res;

            console.log(first);

            await delay(3000);

            const box = await page.$('#dialogCereriFinantare > .ui-dialog-titlebar');
            const bounding_box = await box.boundingBox();

            await page.mouse.move(bounding_box.x + bounding_box.width / 2, bounding_box.y + bounding_box.height / 2);
            await page.mouse.down();
            await page.mouse.move(126, 19);
            await page.mouse.up();
            await delay(3000);

            let version = first["versiune"];
            await delay(3000);

            await page.waitForXPath("//tr/td[3][contains(., '" + version + "')]");
            const [projects] = await page.$x("//tr/td[3][contains(., '" + version + "')]");
            projects.click().catch(e => { });

            await delay(4000);
            await page.goto("https://aplicatii2014.smis.fonduri-ue.ro/smis2014app/faces/pages/comunicare.xhtml").catch(e => { });
            await delay(4000);

            await page.evaluate(() => {
                document.querySelector('#j_idt68 > div > #idPanelContent > #j_idt140 > #j_idt140_content > #j_idt142 > div > .ui-datatable-tablewrapper > table > tbody').scrollIntoView();
            }).catch(e => { });

            await delay(4000);

            const [com] = await page.$x("//tr/td[1][contains(., '37114')]").catch(e => { });

            if (com) {
                com.click().catch(e => { });
            }
            else {
                let [com2] = await page.$x("//tr/td[1][contains(., '" + nrinreg + "')]");
                await delay(2000);
                do {
                    page.click('#j_idt68 > div > #idPanelContent > #j_idt140 > #j_idt140_content > #j_idt142 > div > div[id="j_idt142:idComunicareTable_paginator_bottom"] > .ui-paginator-next').catch(e => { });
                    await delay(4000);
                    let [com2] = await page.$x("//tr/td[1][contains(., '" + nrinreg + "')]").catch(e => { });
                    if (com2) {
                        break;
                    }
                }
                while (!com2);


                let [com3] = await page.$x("//tr/td[1][contains(., '" + nrinreg + "')]").catch(e => { });
                com3.click().catch(e => { });

                await delay(4000);

                await page.evaluate(() => {
                    document.querySelector('#j_idt68 > div > #idPanelContent > #j_idt140 > div > #idDetaliicomunicare').scrollIntoView();
                }).catch(e => { });

                await delay(4000);
            }

            await delay(4000);

            const listadownload = await page.$$('#j_idt68 > div > #idPanelContent > div > div > #idDetaliicomunicare > div > div > div > ul > li > .ui-treenode-children  > li > span').catch(e => { });

            for (let iteminlistadownload of listadownload) {
                await iteminlistadownload.click({ button: 'right', }).catch(e => { });
                await delay(3000);
                let [viz] = await page.$x('//*[@id="idDetaliicomunicare:j_idt163"]/ul/li/a').catch(e => { });
                viz.click().catch(e => { });
                await delay(3000);
            }


        }

        else {

            let version = first["versiune"];

            await delay(3000);

            const box = await page.$('#dialogCereriFinantare > .ui-dialog-titlebar');
            const bounding_box = await box.boundingBox();

            await page.mouse.move(bounding_box.x + bounding_box.width / 2, bounding_box.y + bounding_box.height / 2);
            await page.mouse.down();
            await page.mouse.move(126, 19);
            await page.mouse.up();

            await delay(3000);
            await page.waitForXPath("//tr/td[3][contains(., '" + version + "')]");
            const [projects] = await page.$x("//tr/td[3][contains(., '" + version + "')]");
            projects.click().catch(e => { });

            await delay(4000);
            await page.goto("https://aplicatii2014.smis.fonduri-ue.ro/smis2014app/faces/pages/comunicare.xhtml").catch(e => { });
            await delay(4000);

            await page.evaluate(() => {
                document.querySelector('#j_idt68 > div > #idPanelContent > #j_idt140 > #j_idt140_content > #j_idt142 > div > .ui-datatable-tablewrapper > table > tbody').scrollIntoView();
            }).catch(e => { });


            await delay(4000);

            const [com] = await page.$x("//tr/td[1][contains(., '" + nrinreg + "')]").catch(e => { });

            if (com) {
                com.click().catch(e => { });
            }
            else {
                let [com2] = await page.$x("//tr/td[1][contains(., '" + nrinreg + "')]");
                await delay(2000);
                do {
                    page.click('#j_idt68 > div > #idPanelContent > #j_idt140 > #j_idt140_content > #j_idt142 > div > div[id="j_idt142:idComunicareTable_paginator_bottom"] > .ui-paginator-next').catch(e => { });
                    await delay(4000);
                    let [com2] = await page.$x("//tr/td[1][contains(., '" + nrinreg + "')]").catch(e => { });
                    if (com2) {
                        break;
                    }
                }
                while (!com2);


                let [com3] = await page.$x("//tr/td[1][contains(., '" + nrinreg + "')]").catch(e => { });
                com3.click().catch(e => { });

                await delay(4000);

                await page.evaluate(() => {
                    document.querySelector('#j_idt68 > div > #idPanelContent > #j_idt140 > div > #idDetaliicomunicare').scrollIntoView();
                }).catch(e => { });

                await delay(4000);
            }

            await delay(4000);

            const listadownload = await page.$$('#j_idt68 > div > #idPanelContent > div > div > #idDetaliicomunicare > div > div > div > ul > li > .ui-treenode-children  > li > span').catch(e => { });

            for (let iteminlistadownload of listadownload) {
                await iteminlistadownload.click({ button: 'right', }).catch(e => { });
                await delay(3000);
                let [viz] = await page.$x('//*[@id="idDetaliicomunicare:j_idt163"]/ul/li/a').catch(e => { });
                viz.click().catch(e => { });
                await delay(3000);
            }


        }


        await delay(600000);
        await browser.close();

    };

    await cluster.queue(test);
    await cluster.idle();
    await cluster.close();

})();



