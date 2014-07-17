(function ()
{
	var filter = {
		urls: [ '*://*.southwestwifi.com/*' ],
		types: ["stylesheet", "script", "image", "object", "xmlhttprequest", "other"]
	};

	var _tabs = {};
	var _swRegex = /^https?:\/\/[^\/]+\.southwestwifi\.com/;

	chrome.tabs.onUpdated.addListener(onUpdate);
	chrome.tabs.onReplaced.addListener(onReplaced);

	chrome.webRequest.onBeforeRequest.addListener(onBeforeRequest, filter, ['blocking']);

	function onUpdate (tabId, changeInfo, tab)
	{
		if (changeInfo.status === 'loading')
			handleTab(tab);
	}

	function onReplaced (addedTabId, removedTabId)
	{
		delete _tabs[removedTabId];
		_tabs[addedTabId] = true; // set to true until we're sure it's not a sw page to avoid race condition.
		chrome.tabs.get(addedTabId, function (tab)
		{
			if (errorHandler())
				return;

			handleTab(tab);
		});
	}
	
	function handleTab (tab)
	{
		if (_swRegex.test(tab.url))
		{
			_tabs[tab.id] = true;
		}
		else if (_tabs[tab.id])
		{
			_tabs[tab.id] = false;
		}
	}
	
	function onBeforeRequest (details)
	{
		if (!_tabs[details.tabId])
		{
			console.log('canceling request for ' + details.url);
			return { cancel: true };
		}
	}

	function errorHandler ()
	{
		if (chrome.runtime.lastError)
		{
			console.log(chrome.runtime.lastError);
			return true;
		}

		return false;
	}
	
})();