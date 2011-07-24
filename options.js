function fillVals() {
  var store = localStorage['popupcolor'];
  for(var i=0; i < document.optform.popupcolor.length; ++i) {
    if(document.optform.popupcolor[i].value == store) {
      document.optform.popupcolor[i].selected = true;
      break;
    }
  }
  store = localStorage['highlight'];
  if(store == 'yes') {
    document.optform.highlighttext[0].selected = true;
  }
  else
    document.optform.highlighttext[1].selected = true;
}

function getVals() {
  localStorage['popupcolor'] = document.optform.popupcolor.value;
  localStorage['highlight'] = document.optform.highlighttext.value;
  chrome.extension.getBackgroundPage().rcxMain.config.css = localStorage["popupcolor"];
  chrome.extension.getBackgroundPage().rcxMain.config.highlight = localStorage["highlight"];
}
window.onload = fillVals;
