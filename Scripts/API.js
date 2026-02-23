var obj_colors = {
	'd': [255, 220, 210],		// directions (d) + default
	'c': [255, 246, 204],		// constellations (c)
	's': [240, 172, 117],		// stars (s)
	'm': [232, 112, 95],		// messier (m)
	'o': [247, 114, 105],		// objects (o)
	'p': [63, 118, 196]			// planets (p)
}
var color_shift = 100/255;

function giveMeColor(objType)
{
	if ( obj_colors[objType] )
		return {
			'r': color_shift * obj_colors[objType][0],
			'g': color_shift * obj_colors[objType][1],
			'b': color_shift * obj_colors[objType][2]
		};
	else
		return {
			'r': color_shift * obj_colors.d[0],
			'g': color_shift * obj_colors.d[1],
			'b': color_shift * obj_colors.d[2]
		}
}

function starnumber(objName, objType, targetButn, stickToggle, stickFade, alreadyUsed)
{
	if ( !alreadyUsed )
	{
		print(targetButn+' has already been used!');
		return;
	}
	
	var qCount = Ds.GetObjectAttr('myQuiz','count') +1;
	var comV = Ds.GetObjectAttr(targetButn,'command')['command'];
	
	Ds.SetObjectAttr(targetButn, 'command',comV.slice(0,comV.length-5)+'false)');
		Ds.Wait();
	Ds.SetObjectAttr(targetButn, 'label', qCount+'. '+objName);
		Ds.Wait();
	
	Ds.SetObjectAttr('myQuiz', 'message', (Ds.GetObjectAttr('myQuiz','message')+targetButn.slice(10,targetButn.length)+','));
		Ds.Wait();

	var objBorder=
		objType=='c' ? objName+'border'
			: objType=='s' ? 'star'+objName+'marker'
			: (objType=='m' || objType=='p') ? objName+'marker'
			: objType=='d' ? objName
			: objName;
	var objLabel=
		(objType=='c' || objType=='m' || objType=='p') ? objName+'label'
			: objType=='s' ? 'star'+objName+'label'
			: '';
	
	
	var color = giveMeColor(objType);
	
	Ds.SetObjectAttr(targetButn,'color', {r:0,g:0,b:0}, {total:0.3});
	Ds.SetObjectAttr(targetButn,'labelColor', color, {total:0.3});
	Ds.SetObjectAttr(targetButn,'borderColor', color, {total:0.3});
		Ds.Wait();
	Ds.SetObjectAttr('myQuiz', 'count', qCount);

	Ds.SendStringCommand(objBorder+' on');
		Ds.Wait();
		
	
	
	if ( objType=='c' && stickToggle )
	{
		Ds.SendStringCommand(objName+'stick on int 75 duration 1');
		Ds.Wait();
	}
		
	if (objLabel[0])
		Ds.SendStringCommand(objLabel+' on int 100 text "#'+qCount+'" dur 1');
	else if (objType!=='o')
	{
		Ds.SendStringCommand(objBorder+' int 100 dur 1');
			Ds.Wait();
		Ds.SendStringCommand(objBorder+' text "#'+Ds.GetObjectAttr('myQuiz','count')+' (compass direction)"');
	}
	else if (objName=='celequator' || objName=='ecliptic')
		Ds.SendStringCommand(objName+'Text intensity 0');
	else
		Ds.SendStringCommand(objName+'Text on int 100 text "#'+qCount+'" dur 1');
	
	
	if( objType=='c' && stickToggle && stickFade )
	{
	//	print('now changed int back!');
	//	Ds.SendStringCommand(objName+'stick int 100 duration 2');
	}
}

//--------------------------------------------------------------------------------------

function undo(){
	var usedButtons = Ds.GetObjectAttr('myQuiz', 'message');
		if ( usedButtons.length < 2 ) return;
	
	var usedButtons_Array = JSON.parse('['+usedButtons.slice(0,usedButtons.length-1)+']');
	var spam = parseInt(usedButtons_Array[usedButtons_Array.length-1]);
	var buttonID = 'quizButton' + (spam<10 ?'0'+spam :spam);
		var buttonLabel = Ds.GetObjectAttr(buttonID, 'label');
	var objName = buttonLabel.substring(0,4).replace(/([0-9.]|\s)/g,'') + buttonLabel.substring(4);
	
	var oldComV = Ds.GetObjectAttr(buttonID,'command')['command'];
		var newArray = JSON.parse('['+oldComV.slice(oldComV.search('\''),-1)+']');
	Ds.SetObjectAttr(buttonID, 'command', oldComV.slice(0,-6)+'true)');
		Ds.Wait();
		
	
	var objType = newArray[1];
	var color = giveMeColor(objType);
		
	
	Ds.SetObjectAttr(buttonID, 'label', objName);
	Ds.SetObjectAttr(buttonID, 'color', color,{total:0.3});
		Ds.SetObjectAttr(buttonID, 'labelColor',{r:0,g:0,b:0},{total:0.3});
		Ds.SetObjectAttr(buttonID, 'borderColor',color,{total:0.3});
			Ds.Wait();
	
	
	Ds.SetObjectAttr('myQuiz', 'count', parseInt(buttonLabel.slice(0,2).replace(/[.]/,''))-1);
	Ds.SetObjectAttr('myQuiz', 'message', usedButtons.slice(0,-3));
	
	
	if (objType=='c') Ds.SendStringCommand(objName+'stick off dur 0.2');
		Ds.Wait();
	
	var objBorder=
		objType=='c' ? objName+'Border'
			: objType=='s' ? 'star'+objName+'Marker'
			: (objType=='m' || objType=='p') ? objName+'Marker'
			: objType=='d' ? objName
			: objName;
	var objLabel=
		(objType=='c' || objType=='m' || objType=='p') ? objName+'Label'
			: objType=='s' ? 'star'+objName+'Label'
			: null;
			
	if ( objLabel !== null )
		Ds.SendStringCommand(objLabel+" intensity 0.00 dur 0.2");
	if ( objType !== 'o' )
		Ds.SendStringCommand(objBorder+" intensity 0.00 dur 0.2");
	else
		Ds.SendStringCommand(objName+" off dur 0.2");
}