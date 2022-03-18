


if (localStorage["ClassName1"] == undefined) {
	localStorage.setItem('ClassName1', 'template-color-1');
}
else {
	$("#MyElement").addClass(localStorage.getItem('ClassName1'));
	$("#hehe").addClass(localStorage.getItem('ClassName2'));
}
const btn = document.querySelector(".me23");
	btn.addEventListener("click",
		function () {
			if (localStorage.getItem("ClassName1") === 'template-color-1') {
				$("#MyElement").removeClass("template-color-1").addClass("white-version");
				localStorage.setItem('ClassName1', 'white-version');
				$("#hehe").removeClass("fas fa-lightbulb").addClass("fas fa-moon");
				localStorage.setItem('ClassName2', 'fas fa-moon');
			}
			else {
				$("#MyElement").removeClass("white-version").addClass("template-color-1")
				localStorage.setItem('ClassName1', 'template-color-1');
				$("#hehe").removeClass("fas fa-moon").addClass("fas fa-lightbulb");
				localStorage.setItem('ClassName2', 'fas fa-lightbulb');
			};
		});
