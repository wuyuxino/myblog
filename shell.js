const shell = require('shelljs');

if (!shell.which('git')) {
	shell.echo('Error: 抱歉，此脚本需要安装Git');
	shell.exit(1);
}

shell.echo('开始执行脚本文件！！！');

shell.rm('-rf', 'build');

if (shell.exec('npm run build').code !== 0) {
	shell.echo('Error: 打包文件失败');
	shell.exit(1);
}

shell.cd('build');

if (shell.exec('scp -r ./* root@106.13.63.7:/home/web/my_blog').code !== 0) {
	shell.echo('Error: 上传服务器失败！！！！');
	shell.exit(1);
}

shell.cd('..')

shell.echo('脚本文件执行完毕！！！');