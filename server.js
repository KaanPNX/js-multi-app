const { rejects } = require('assert');
const chalk = require('chalk');
const fs = require('fs');
const process = require('process');
const cp = require('node:child_process');

fs.readdir('./Uygulamalar',function(err,data){
    if(err){
        return console.log(chalk.red(`[${new Date().toTimeString().split(' ')[0]} Hata]`) + " Uygulamalar klasörü yok lütfen Uygulamalar adında klasör oluşturun.")
    }
})

var data = fs.readdirSync('./Uygulamalar');

if(data.length == 0){
    return console.log(chalk.red(`[${new Date().toTimeString().split(' ')[0]} Hata]`) + " Proje bulunamadı.")
};

console.log(chalk.yellow(`[${new Date().toTimeString().split(' ')[0]} Client]`) + " Worker Başlatılıyor.")

if(process.versions.node < "18.0.2"){
    console.log(chalk.green(`[${new Date().toTimeString().split(' ')[0]} Bilgi]`) + " Node versiyonunuz güncel değil.")
    console.log(chalk.green(`[${new Date().toTimeString().split(' ')[0]} Bilgi]`) + " https://nodejs.org/en/ adresinden güncelleyebilirsiniz.")
}

console.log(chalk.green(`[${new Date().toTimeString().split(' ')[0]} Bilgi]`) + ` ${data.length} tane proje bulundu.`);
new Promise((resolve,rejects) => {
    data.forEach((item) => {
        new Promise((resolve, reject) => {
            fs.readFile('./Uygulamalar/'+item+"/package.json",function(err,data){
                if(err)return reject();
                return resolve();
            });
        }).then(() => {
            console.log(chalk.black(`[${new Date().toTimeString().split(' ')[0]} Yüklendi]`) + ` ${item} Projesi yüklendi.`);
            resolve();
        }).catch(() => console.log(chalk.red(`[${new Date().toTimeString().split(' ')[0]} Hata]`) + `${item} Projesinde package.json bulunamadı.`))
    });
}).then(() => {
    new Promise((resolve,rejects) => {
        console.log(chalk.yellow(`[${new Date().toTimeString().split(' ')[0]} Client]`) + " Index dosyaları çalıştırılıyor.");
        return resolve();
    }).then(() => {
        fs.readdir('./Uygulamalar',function(err,data){
            data.forEach(item => {
                cp.exec(`cd Uygulamalar/${item} && npm install && npm start`,(error, stdout, stderr) => {
                    if(stderr == ""){
                    }else{
                        return console.log(chalk.red(`[${new Date().toTimeString().split(' ')[0]} Hata]`) + `${item} Projesinde derleyici tarafından hata alındı.`);
                    }
                })

                console.log(chalk.yellow(`[${new Date().toTimeString().split(' ')[0]} Client]`) + ` ${item} Projesi çalıştırıldı.`);
            })
        })
    })
})

process.on('exit',function(){
    console.log(chalk.blue(`[${new Date().toTimeString().split(' ')[0]} Uyarı]`) + " Sunucu kapatılıyor...");
});
