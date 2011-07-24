var rcxMain = {
  haveNames: false,
  canDoNames: false,
  dictCount: 2,
  altView: 0,
  enabled: 0,

  loadDictionary: function() {
    if (!this.dict) {
      try {
        this.dict = new rcxDict(false);
      }
      catch (ex) {
        alert('Error loading dictionary: ' + ex);
        return false;
      }
    }
    return true;
  },
  // The callback for onSelectionChanged
  // Just sends a message to the tab to enable itself if it hasn't
  // already
  onTabSelect: function(tabId) { rcxMain._onTabSelect(tabId); },
  _onTabSelect: function(tabId) {

    if ((this.enabled == 1))
      chrome.tabs.sendRequest(tabId, {"type":"enable", "config":rcxMain.config});
  },

  miniHelp:
    '<span style="font-weight:bold">Rikaisama has entered the building!</span><br><br>' +
    '<table cellspacing=5>' +
    '<tr><td>A</td><td>Alternate popup location</td></tr>' +
    '<tr><td>Y</td><td>Move popup location down</td></tr>' +
    '<tr><td>Shift/Enter&nbsp;&nbsp;</td><td>Switch dictionaries</td></tr>' +
    '<tr><td>B</td><td>Previous character</td></tr>' +
    '<tr><td>M</td><td>Next character</td></tr>' +
    '<tr><td>N</td><td>Next word</td></tr>' +
    '</table>',

  // Function which enables the inline mode of rikaisama
  // Unlike rikaichan there is no lookup bar so this is the only enable.
  inlineEnable: function(tab, mode) {
    if (!this.dict) {
      if (!this.loadDictionary()) return;
    }

    // Send message to current tab to add listeners and create stuff
    chrome.tabs.sendRequest(tab.id, {"type":"enable", "config":rcxMain.config});
    this.enabled = 1;

    if(mode == 1) {
      chrome.tabs.sendRequest(tab.id, {"type":"showPopup", "text":rcxMain.miniHelp});
    }
    chrome.browserAction.setBadgeBackgroundColor({"color":[255,0,0,255]});
    chrome.browserAction.setBadgeText({"text":"On"});
  },

  // This function diables
  inlineDisable: function(tab, mode) {
    // Delete dictionary object after we implement it
    delete this.dict;

    this.enabled = 0;
    chrome.browserAction.setBadgeBackgroundColor({"color":[0,0,0,0]});
    chrome.browserAction.setBadgeText({"text":""});

    // Send a disable message to all browsers
    var windows = chrome.windows.getAll({"populate":true},
        function(windows) {
          for (var i =0; i < windows.length; ++i) {
            var tabs = windows[i].tabs;
            for ( var j = 0; j < tabs.length; ++j) {
              chrome.tabs.sendRequest(tabs[j].id, {"type":"disable"});
            }
          }
        });
  },

  inlineToggle: function(tab) {
    if (rcxMain.enabled) rcxMain.inlineDisable(tab, 1);
    else rcxMain.inlineEnable(tab, 1);
  },

  kanjiN: 1,
  namesN: 2,

  search: function(text, showmode) {
    var m = showmode;
    var showMode = showmode;
    var e = null;

    do {
      switch (showMode) {
        case 0:
          e = this.dict.wordSearch(text, false);
          break;
        case this.kanjiN:
          e = this.dict.kanjiSearch(text.charAt(0));
          break;
        case this.namesN:
          e = this.dict.wordSearch(text, true);
          break;
      }
      if (e) break;
      showMode = (showMode + 1) % this.dictCount;
    } while (showMode != m);

    return e;
  }



};



/*
   2E80 - 2EFF  CJK Radicals Supplement
   2F00 - 2FDF  Kangxi Radicals
   2FF0 - 2FFF  Ideographic Description
   p  3000 - 303F CJK Symbols and Punctuation
   x  3040 - 309F Hiragana
   x  30A0 - 30FF Katakana
   3190 - 319F  Kanbun
   31F0 - 31FF Katakana Phonetic Extensions
   3200 - 32FF Enclosed CJK Letters and Months
   3300 - 33FF CJK Compatibility
   x  3400 - 4DBF  CJK Unified Ideographs Extension A
   x  4E00 - 9FFF  CJK Unified Ideographs
   x  F900 - FAFF  CJK Compatibility Ideographs
   p  FF00 - FFEF Halfwidth and Fullwidth Forms
   x  FF66 - FF9D  Katakana half-width

*/
