var obj1 = document.getElementById("encrypt-input");

obj1.addEventListener("change",function(e){

    if(e.target.files.length!=1){
			alert('暗号化したいファイルを選択してください。');
			return false;
		}

		file = e.target.files[0];
		//console.log(file);

        if(file.size > 10240*1024){
			alert('10MBまで(にしておく)');
			return;
		}

		reader = new FileReader();
});

var obj1 = document.getElementById("decrypt-input");

obj1.addEventListener("change",function(e){

    if(e.target.files.length!=1){
			alert('復号したいファイルを選択してください。');
			return false;
		}

		file = e.target.files[0];
		//console.log(file);


		reader = new FileReader();
});