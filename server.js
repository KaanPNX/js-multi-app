const chalk = require('chalk');
const fs = require('fs');
const cp = require('child_process');
const path = require('path');

const reportFile = './performance_report.log';
fs.writeFileSync(reportFile, '');

const log = (message, type = 'info') => {
    const timestamp = `[${new Date().toISOString()}]`;
    const color = type === 'info' ? chalk.green : type === 'error' ? chalk.red : chalk.yellow;
    const fullMessage = `${timestamp} ${message}`;
    console.log(color(fullMessage));
    fs.appendFileSync(reportFile, `${fullMessage}\n`);
};

const measureTime = async (label, callback) => {
    const startTime = Date.now();
    try {
        await callback();
        return Date.now() - startTime;
    } catch (error) {
        throw error;
    }
};

const uygulamalarDir = './Uygulamalar';
if (!fs.existsSync(uygulamalarDir)) {
    log('Uygulamalar klasörü yok. Lütfen "Uygulamalar" adında klasör oluşturun.', 'error');
    process.exit(1);
}

const projects = fs.readdirSync(uygulamalarDir).filter((item) => {
    const itemPath = path.join(uygulamalarDir, item);
    return fs.statSync(itemPath).isDirectory();
});

if (projects.length === 0) {
    log('Proje bulunamadı.', 'error');
    process.exit(1);
}

log(`${projects.length} proje bulundu. İşlem başlıyor...`, 'info');

const results = [];

(async () => {
    const promises = projects.map(async (project) => {
        const projectPath = path.join(uygulamalarDir, project);
        log(`Proje işleniyor: ${project}`, 'info');

        let installTime = null;
        let startTime = null;
        let status = 'Başarılı';

        try {
            installTime = await measureTime(`${project} - npm install`, () => {
                return new Promise((resolve, reject) => {
                    const install = cp.spawn('npm', ['install'], { cwd: projectPath, stdio: 'inherit' });
                    install.on('close', (code) => {
                        code === 0 ? resolve() : reject(new Error(`npm install başarısız.`));
                    });
                });
            });

            startTime = await measureTime(`${project} - npm start`, () => {
                return new Promise((resolve, reject) => {
                    const start = cp.spawn('npm', ['start'], { cwd: projectPath, stdio: 'inherit' });
                    start.on('close', (code) => {
                        code === 0 ? resolve() : reject(new Error(`npm start başarısız.`));
                    });
                });
            });
        } catch (error) {
            status = 'Başarısız';
            log(`${project} için hata oluştu: ${error.message}`, 'error');
        }

        results.push({
            project,
            installTime: installTime ? `${installTime} ms` : 'N/A',
            startTime: startTime ? `${startTime} ms` : 'N/A',
            status,
        });
    });

    await Promise.allSettled(promises);

    log('Performans raporu oluşturuluyor...', 'info');
    results.forEach((result) => {
        log(
            `Proje: ${result.project}, Install Süresi: ${result.installTime}, Start Süresi: ${result.startTime}, Durum: ${result.status}`,
            result.status === 'Başarılı' ? 'info' : 'error'
        );
    });

    log('Tüm işlemler tamamlandı.', 'info');
})();
