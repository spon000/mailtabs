///////////////////////////////////////////////////////////////////////
// Mailtabs
// Browser Addon (tested under Firefox).
// Uses JQuery 3.2.1
//
// This addon will allow a user to email or save to clipboard all the 
// browser tab titles and URLs they have open under either their current 
// browser window or all open browser windows. 
//
// The icons were provided by www.shareicon.net
// https://www.shareicon.net/tabs-tab-web-interface-browser-multimedia-new-browsers-seo-and-web-819241
// 
// The files for this add on can be found on github:
// https://github.com/spon000/mailtabs


// The .ready() method offers a way to run JavaScript code as soon 
// as the page's Document Object Model (DOM) becomes safe to manipulate.
$(document).ready(function () {
	// queryinfo sets parms for the browser.tabs query method.
	var queryInfo = {};
	// options are used for the email dialog. 
	var options = {
		"recipient": "",
		"subject": ""
	};

	// This addon will store the certain fields so that they remain 
	// persistant between uses. The getStoredOptions() function retrieves 
	// any previously stored fields
	getStoredOptions();

	// The mail it button will issue a call to mailto dialog which
	// is the user's default email client on the current machine. If
	// the user does not have a default email client set up then nothing
	// will happen.
	$("#mailit-button").click((e) => {
		queryInfo = getAllWindowsBox();
		browser.tabs.query(queryInfo).then((result) => {
			// Any email body to be sent needs to be encoded in URI
			// compatable format.
			var mailToBody = encodeURI(createTabDoc(result));

			openMailDialog(mailToBody);
			// Store the fields so that they remail persistent between 
			// addon calls.
			setStoredOptions(options);
		});
	});

	// The generate-button queries for the browser tabs and allows a
	// a user to save them to clipboard.
	// The reason there is a generate button and a save to clipboard button is
	// due to most browsers restriction of programatically copy data to the
	// clipboard. The only way to do it is if it's issued immediately after 
	// a user-generated event like a button click. 
	$("#generate-button").click((e) => {
		queryInfo = getAllWindowsBox();
		browser.tabs.query(queryInfo).then((result) => {
			// Create a nice text representation of the list of tabs
			// and store it in this variable.
			var clipboardText = createTabDoc(result);
			// Create a textarea HTML element that will hold
			// the tabs list. This textarea will be hidden
			// and not displayed to the user.
			var textArea = document.createElement("textarea");

			textArea.setAttribute("id", "hidden-text-area");
			textArea.value = clipboardText;
			$("body").append(textArea);
			$("#generate-button").css("display", "none");
			$("#saveit-button").css("display", "inline");
		});

	});

	$("#saveit-button").click((e) => {
		// We have to briefly un-hide the text area so we can
		// select the text for the 'copy' function. We'll
		// remove it right after the text is copied so the
		// the user should never see it.
		$("textarea").css("display", "inline");
		$("textarea").select();

		// Copy the text and create a status message on whether it 
		// was successful or not.
		if (document.execCommand('copy')) {
			$(".status-message").append("<p>Copied to the clipboard!</p>");
		} else {
			$(".status-message").append("<p style='color:red'>Could not copy to clipboard.</p>");
		}

		// Stop even propagation so that we can check for a <body> click 
		// event that will remove the status message.
		e.stopPropagation();
		$("body").one("click", (e) => {
			$(".status-message p").remove();
		});
		$("#hidden-text-area").remove();
		$("#generate-button").css("display", "inline");
		$("#saveit-button").css("display", "none");
	});

	// This check box says whether the user wants all the 
	// browser tabs from each browser window or just the current
	// window.
	$("#allWindowsCheck").change((e) => {
		$("#hidden-text-area").remove();
		$("#generate-button").css("display", "inline");
		$("#saveit-button").css("display", "none");
	});

	// If the #allWindowsCheck checkbox is checked then
	// the query params for the browser.tab.query method will be
	// an empty object which means all windows.
	function getAllWindowsBox() {
		if (!($("#allWindowsCheck")[0].checked))
			return {
				"currentWindow": true
			};
		else
			return {};
	}

	// Uses the browser.storage.local API method to retrieve 
	// the locally stored parameters used by the addon.
	// The fields in the popup window will be populated with
	// these values if they exist.
	function getStoredOptions() {
		browser.storage.local.get().then(
			(opts) => {
				if (opts.storedOpts) {
					$("#recipientText")[0].value = opts.storedOpts.recipient;
					$("#subjectText")[0].value = opts.storedOpts.subject;
				}
			}
		);
	}

	// Uses the browser.storage.local API method to store
	// fields specified by the user for emailing the tabs.
	function setStoredOptions(opts) {
		browser.storage.local.set({
			storedOpts: opts
		});
	}

	// Takes the query results from browser.tabs.query API method
	// and formats them into a readable text page.
	function createTabDoc(tabs) {
		var tabsContent = "\n";
		tabs.forEach((tab) => {
			tabsContent += tab.title + "\n";
			tabsContent += encodeURI(tab.url) + "\n";
			tabsContent += "-".repeat(50) + "\n\n";
		});
		return tabsContent;
	}

	// Opens the default mail client email dialog and uses the fields
	// specified by the user to populate some of the email fields.
	function openMailDialog(tabDoc) {
		if ($("#recipientText")[0].value) {
			options.recipient = $("#recipientText")[0].value;
		}

		if ($("#subjectText")[0].value) {
			options.subject = $("#subjectText")[0].value;
		}
		document.location = "mailto:" + options.recipient + "?subject=" + options.subject + "&body=" + tabDoc;
	}
});