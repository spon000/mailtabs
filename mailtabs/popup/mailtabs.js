$(document).ready(function(){
	var queryInfo = {};
	var recipient = "";
	var subject = "";
	
	getStoredOptions();

	$("#mailit-button").click((e) => {
		queryInfo = getAllWindowsBox();
		browser.tabs.query(queryInfo).then((result) => {
			var mailToBody = encodeURI(createTabDoc(result));
			openMailDialog(mailToBody);
		});
	});
	
	$("#saveit-button").click((e) => {
		queryInfo = getAllWindowsBox();
		
	});
	
	function getAllWindowsBox() {
		if (!($("#allWindowsCheck")[0].checked)) 
			return {"currentWindow":true};
		else 
			return {};
	}
	
	function getStoredOptions() {
		
	}
	
	function createTabDoc(tabs) {
		var tabsContent = "\n";
		tabs.forEach((tab) => {
			tabsContent += tab.title + "\n";
			tabsContent += tab.url + "\n";
			tabsContent += "-".repeat(50) + "\n\n";
		});
		return tabsContent;
	}
	
	function openMailDialog(tabDoc) {
		if ($("#recipientText")[0].value) {
			recipient = $("#recipientText")[0].value;
		}
		
		if ($("#subjectText")[0].value) {
			subject = $("#subjectText")[0].value;
		}
		document.location = "mailto:"+recipient+"?subject="+subject+"&body="+tabDoc;
	}
	
	function saveToClipboard(tabDoc) {
		
	}

}); 

