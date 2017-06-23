// ==UserScript==
// @name        __no typing during writing time
// @include     http://*
// @include     https://*
// @exclude     file://*
// @grant       none
// ==/UserScript==

//[][][] features to add:
//use a GUI to set blacklist and whitelist site+time values, instead of having to edit this script
//DONE:
//list to blacklist sites during certain times
//list to whitelist sites during certain times
//if site is not on whitelist, then if site is on blacklist, block it.
//to use the same start or end time for multiple sites,
//make a line like  var startworktime = new Date(0,0,0,11,30,0,0);
//date format is (year,month,day,hour,minute,second,millisecond) month goes from 0 to 11
//hours go from 0 to 23 (23 means 11 pm), minutes go from 0 to 59, day 0 is sunday and day 6 is saturday
//2015-09-17 somehow this blocks desktop files. hmm...

var today = new Date();
var workdaystart = new Date(0,0,0,4,0,0,0);
var workdayend = new Date(0,0,0,8,0,0,0);
var weekendworkdayend = new Date(0,0,0,9,0,0,0);
//set the end of work day to weekend time if the day is Saturday or Sunday
if(today.getDay() == 6 || today.getDay() === 0)
	workdayend = weekendworkdayend;
///////////////////////////
/////////BLACKLIST/////////
///////////////////////////
var siteblacklist = [];
siteblacklist.push(["",new Date(0,0,0,0,0,0,0),new Date(0,0,0,4,0,0,0)]);
//siteblacklist.push(["",new Date(0,0,0,11,40,0,0),new Date(0,0,0,13,0,0,0)]);
//siteblacklist.push(["",new Date(0,0,0,8,0,0,0),new Date(0,0,0,11,0,0,0)]);
siteblacklist.push(["",new Date(0,0,0,21,0,0,0),new Date(0,0,0,23,59,59,0)]);
	//2016-03-19 daylight savings time ha
//siteblacklist.push(["newgrounds.com",new Date(0,0,0,0,0,0,0),new Date(0,0,0,23,59,59,0)]);
//siteblacklist.push(["prismata.net",new Date(0,0,0,0,0,0,0),new Date(0,0,0,23,59,59,0)]);
///////////////////////////
/////////WHITELIST/////////
///////////////////////////
var sitewhitelist = [];
sitewhitelist.push(["google.com",new Date(0,0,0,5,0,0,0),new Date(0,0,0,19,59,59,0)]);
sitewhitelist.push(["duckduckgo.com",new Date(0,0,0,5,0,0,0),new Date(0,0,0,19,59,59,0)]);
///////////////////////////
///////////////////////////
///////////////////////////

///////////////////////////
///////REDIRECT LIST///////
///////////////////////////
var redirectlist = [];
//[][][]redirectlist.push(["prismata.net","https://www.overdrive.com/"]);
//redirectlist.push(["test.net","prismata.net"]);

redirectmain(redirectlist);
overlaymain(sitewhitelist,siteblacklist);

function redirectmain(redirectlist)
{
	var stoplist = makeRedirectBlacklist(redirectlist);
	//console.log(stoplist);
	//console.log(redirectlist);
	var address = document.location.href;
	//console.log(stoplist.indexOf(address));
	for (var i=0;i<stoplist.length;i++)
	{
		if (address.indexOf(stoplist[i]) !== -1)
		{
			alert("check redirect list for redirect loops");
			return;
		}
	}
	for (i=0;i<redirectlist.length;i++)
	{
		if (address.indexOf(redirectlist[i][0]) !== -1)
		{
			window.location.replace(redirectlist[i][1]);
			return;
		}
	}
	return;
}
function makeRedirectBlacklist(redirectlist) // don't redirect to a page on the
{
	var checklist = [];
	var stoplist = [];
	for (i=0;i<redirectlist.length;i++)
		checklist.push(redirectlist[i][0]);
	for (i=0;i<redirectlist.length;i++)
	{
		if (checklist.indexOf(redirectlist[i][1]) !== -1)
		{
			stoplist.push(redirectlist[i][0]);
			stoplist.push(redirectlist[i][1]);
		}
	}
	return stoplist;
}

//document.body.innerHTML = document.location.href;
//var address = document.location.href;
//document.body.innerHTML = address;
//document.body.innerHTML = address.indexOf("about:reader");
//return;

function overlaymain(sitewhitelist, siteblacklist)
{
//create html elements
	var overlay = document.createElement('div');
		overlay.id = 'BlockScreen';
		overlay.style.backgroundColor = '#FFF';
		overlay.style.color = '#000';
		overlay.style.fontSize = '48px';
		overlay.style.fontFamily = 'Helvetica, Arial, Sans';
		overlay.style.fontWeight = 'bold';
		overlay.style.textDecoration = 'none';
		overlay.style.position = 'absolute';
		overlay.style.top = '0px';
		overlay.style.left = '0px';
		overlay.style.width = '12000%';
		overlay.style.height = '24000%';
		overlay.style.paddingTop = '20px';
		overlay.style.paddingLeft = '20px';
		overlay.style.margin = '0px';
		overlay.style.textAlign = 'left';
		overlay.style.zIndex = '9999999999';
		overlay.style.display = 'none';
	window.allowAccess = function()
	{
		document.getElementById('BlockScreen').style.display = 'none';
	};
	window.denyAccess = function()
	{
		document.getElementById('BlockScreen').style.display = 'inline';
	};
	
	document.getElementsByTagName('body')[0].appendChild(overlay);
	//allowAccess();
	//denyAccess();
	var outofafilterrange = 0;
	var whitelisted = 0;
	
	//setTimeout( //2015-03-14 testing setTimeout so it only adds the whitespace once. ...but actually this is wrong because I want it to remove the block at the specified end time too.
	setInterval(
		function()
		{
      var d = new Date();
			outofafilterrange = 0;
			whitelisted = 0;
      d = new Date(0,0,0,d.getHours(),d.getMinutes(),d.getSeconds(),0);
      var address = document.location.href;
      //whitelist gets priority. If it's on any whitelist, don't block it.
			for (var j=0;j<sitewhitelist.length;j++)
			{
				if(address.indexOf(sitewhitelist[j][0]) != -1)
				{
					if(d >= sitewhitelist[j][1] && d <= sitewhitelist[j][2])
					{
						whitelisted = 1;
						//2015-03-17 I have sites whitelisted for certain times and they don't get unblocked at the right time
						if(document.getElementById('BlockScreen') !== null)
							allowAccess();
					}
				}
			}
			//then if the page is on any blacklist at this time, block the page
			if(whitelisted === 0)
			{
				for (var i=0;i<siteblacklist.length;i++)
				{
					if(address.indexOf(siteblacklist[i][0]) != -1)
					{
						//if(d.getSeconds() % 7 >=2 && d.getSeconds() % 7 <=5)
						if(d >= siteblacklist[i][1] && d <= siteblacklist[i][2])
						{
							if(document.getElementById('BlockScreen') === null)
								{document.getElementsByTagName('body')[0].appendChild(overlay);}
							//[][][]2015-05-15 this doesn't block the entire page on xkcd, leaving some blue on the top and to the left
							denyAccess();
							break;
						}
						else if(d < siteblacklist[i][1] || d > siteblacklist[i][2])
							outofafilterrange = 1;
					}
					//if it wasn't on any blacklist and it's the end of the list, unblock it
					if(i+1 == siteblacklist.length && outofafilterrange == 1)
					{
						if(document.getElementById('BlockScreen') !== null)
						{
							allowAccess();
							var list=document.getElementById('BlockScreen');
                            if (list.childNodes.length > 0)
                                if (list.childNodes[0] !== null)
                                    list.removeChild(list.childNodes[0]);
						}
					}
				}
			}
		} ,1000 //2 seconds is juuuust enough to peek at a dictionary search when I'm writing
    );
	return;
}
