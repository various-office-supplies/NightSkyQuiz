
// This script is a compiler; it takes all the contents of the
// 		objects file (default 'sample quiz.txt'), analyzes them
//		line-by-line, then updates the quiz's console accordingly.

// I expanded the code here to make it easier to read.
//		Originally, there was a condensed version in Common that
//		was smaller, but it wasn't efficient enough to warrant
//		how terrible it was to read.  So please just use this one :)



// Customizable stuff (needs changes to Control Panel if >50)
var max_objects = 50;



// These initialize our variables.
var fileRef,								// Reference for list file.
	currentLine      = 0,					// line number during iteration
	objUsedSoFar     = 0, 					// counts how many objects are added to console
	stickToggle      = false, 				// true = constellation sticks are enabled
	stickFade        = false, 				// true = constellation sticks will fade out after use
	alphabetizeList  = false,				// true = Objects are sorted by Name, false = Objects are stored by type (constellation, direction, etc.)
	categorizeList   = false,				// true = follow constellations with their stars
	listenForComv    = false,				// is true if current line is input for '!addCommands'
	listenForDisplay = false,				// is true if current line is input for '!info'
	listenForOrder   = false,				// is true if current line is input for '!order'

	objList       = [],		  				// array of night-sky objects (future buttons!)
	last          = "",  					// stores current category in loop
	category__obj = {}, 					// saves dictionary of category names
	infoList      = [],						// stores list of lines from !info
	orderList     = [];						// stores list of lines from !order
	
	
	
	
// Asks user to select list file.
// List file's name can be changed as long as formatting is correct.
try
{ 
	fileRef = Ds.FileOpen(Ds.FileGetOpenName(), 'r');
}

	//If file select is canceled by user, saves in messages and disables script.
	catch(err)
	{
		print('No file selected!');
		fileRef = 0;
	}


// If file is valid, open and read contents
if( fileRef )
{

// in case there's any bugs, we put the whole thing in a try-catch statement so we can print to console
try
{

// loop until End-of-File
while( Ds.FileEOF(fileRef) == 0 )
{

	// Defines lineContents as the text on current line
	var lineContents = Ds.FileReadLine(fileRef).replace(/[^\x00-\x7F]/g,'');
	
	//		then if first character of line is empty, or includes "#", or only includes spaces: skip
		if( !lineContents[0] || lineContents[0]=='\#'|| (lineContents[0]=='\t' && (lineContents.length==1 || lineContents[1]==' ' || lineContents[1]=='\t')) ) continue;
	
	// 		then increases currentLine by 1.
		lineContents = lineContents[0] + lineContents.slice( (1-lineContents.length) );
		currentLine++;
	
	
	// If 2nd character of current line is a '-', it recognizes
	// 		line as a category and updates relavent variables.
	if ( lineContents[1] == '-' )
	{
		listenForComv    = false;
		listenForDisplay = false;
		listenForOrder   = false;
		
		var category = lineContents[3].toLowerCase();
		last = category;
	}
		// If first character is a '/', it stops reading lines and ends loop.
		else if ( lineContents[0]=='\/' ) break;
		
		// If first character is a '!', it recognizes it as a command and
		// 		searches for known function. If not recognized, prints error.
		else if( lineContents[0] == '\!' )
		{
			listenForComv    = false;
			listenForDisplay = false;
			listenForOrder   = false;
			
			if( lineContents.slice(1,5) == 'date' )
			{
				print('date set to: \''+ lineContents.slice(6, lineContents.length) +'\'');
				Ds.SendStringCommand('scene date '+ lineContents.slice(6, lineContents.length) +' local');
			}
				else if( lineContents.slice(1,10) == 'stickFade' ) stickFade = true;
				else if( lineContents.slice(1,6) == 'stick' ) stickToggle = true;
				else if( lineContents.slice(1,6) == 'order' ) listenForOrder = true;
				else if( lineContents.slice(1,12) == 'alphabetize' ) alphabetizeList = true;
				else if( lineContents.slice(1,11) == 'addCommand' ) listenForComv = true;
				else if( lineContents.slice(1,5) == 'info' ) listenForDisplay = true;
				else print('Check your spelling! [line '+currentLine+']');
		}
		
		// If listening for !addCommands, sends current line as Digistar command.
		else if ( listenForComv ) Ds.SendStringCommand( lineContents.slice(1, lineContents.length) );
		
		// If listening for !info, saves current line as string in infoList.
		else if ( listenForDisplay ) infoList.push(lineContents.slice(1,lineContents.length));
		
		// If listening for !order, saves current line as string in orderList.
		else if ( listenForOrder ) orderList.push(lineContents.slice(1,lineContents.length)); 
		
		// If an object to add, adds current line to objList.
		else if ( true )
		{
			var obj_name = lineContents.slice(1, lineContents.length).trim();
			
			objList.push( obj_name );				// save object
			category__obj[ obj_name ] = last;		// save keypair object-category so we can lookup category later
			objUsedSoFar++;
			
		// If line does not meet any of above criteria, it assumes end-of-file was hit and stops loop.
		} else
		{
			break;
			/*

	-->	This Windows API call doesn't isn't sent correctly by digistar. Ask digistar support about PopupMessage() starting minimized to taskbar.	
	
			var stopQuiz=Ds.PopupMessage('Reached max of '+max_objects+' items at line '+currentLine+' in list.\n\n--> Press OK to use current items only.\n--> Press CANCEL if necessary items might be excluded.','Continue\?','OKCANCEL','ICONWARNING','TOPMOST');
			if (stopQuiz==1) break;
			else if (stopQuiz==2) {
				objCategories=[];
				break;
			}
			
			*/
		}
}


// Done reading file; continuing rest of script.
Ds.FileClose(fileRef);


// if error, report to console what happened
} catch(err)
{
	throw ('Manual Error Report:\n-> Crashed at line ['+currentLine+'] of txt file;\n-> # of objects imported: '+objUsedSoFar+';\n'+err);
}

/*
for (let cQ=0;cQ<infoList.length;cQ++){
		var currentInfoItem='fancyMessage'+(cQ>8?(cQ+1):'0'+(cQ+1));
	Ds.CreateObject(currentInfoItem,'textClass','temporary');
		Ds.SetObjectAttr(currentInfoItem,'text',infoList[cQ]);
		Ds.SetObjectAttr(currentInfoItem,'position',{x:0,y:10*cQ,z:2,unit:'m',mode:'SPHERICAL'});
		Ds.SetObjectAttr(currentInfoItem,'textScale',{x:1,y:1});
		Ds.SetObjectAttr(currentInfoItem,'color',{r:100,g:100,b:100});
		Ds.SetObjectAttr(currentInfoItem,'intensity',100);
	Ds.SceneAddObject(null,currentInfoItem,'fixed');
}
*/



// Changes order of objects (alphabetize + !order)
if( orderList.length )	// true if we saw !order command
{
	var objListCopy = [];
	
	for (var obj_index = 0;  obj_index < orderList.length;  obj_index++)
	{
		var obj = orderList[obj_index];
		
		if( objList.contains( obj ) )
		{
		//	print('saw '+obj+'  ['+orderList.indexOf(obj)+']');
			objListCopy.push(obj);
		}
	}
	
	for (var obj_index = 0;  obj_index < objList.length;  obj_index++)
	{
		var obj = objList[obj_index];
		
		if( !objListCopy.contains( obj ) )
		{
		//	print('missing '+obj+'  ['+objList.indexOf(obj)+']');
			objListCopy.push(obj);
		}
	}
	
//	print(orderList);
//	print(objList);
//	print( objListCopy );
//	print('and, alpheratz, m31, aql, saturn, ...');
		
	objList = objListCopy;
	

} else if( alphabetizeList )	// true if !alphabetize was seen
{
	objList = objList.sort();


} else	// didn't see !order or !alphabetize
{
	objList = objList;
	
}



// This part adds the buttons and applies their properties.
var btn_ID = 0;
for (var obj_index = 0;  obj_index < objList.length;  obj_index++)
{
	var obj = objList[obj_index];
	btn_ID++;
	
	if( btn_ID > max_objects )break;	// quit adding buttons if reached max
	
	var category = category__obj[ obj ];
	var buttonName = 'quizButton' +  (btn_ID < 10  ?'0'  :'') + btn_ID;
	Ds.CreateObject( buttonName, 'buttonClass' );
	
	var color_shift = 100/255;
	var color;
	var obj_colors = {
		'd': [255, 220, 210],		// directions (d) + default
		'c': [255, 246, 204],		// constellations (c)
		's': [240, 172, 117],		// stars (s)
		'm': [232, 112, 95],		// messier
		'o': [247, 114, 105],		// objects (o)
		'p': [63, 118, 196]			// planets (p)
	}
	
	if ( obj_colors[category] )
		color = {
			'r': color_shift * obj_colors[category][0],
			'g': color_shift * obj_colors[category][1],
			'b': color_shift * obj_colors[category][2]
		};
	else
		color = {
			'r': color_shift * obj_colors.d[0],
			'g': color_shift * obj_colors.d[1],
			'b': color_shift * obj_colors.d[2]
		}
	
	
	Ds.SetObjectAttr( buttonName,'label', obj );
	Ds.SetObjectAttr( buttonName,'fontsize', 32 );
	Ds.SetObjectAttr( buttonName,'color', color );
	Ds.SetObjectAttr( buttonName,'labelColor', { r:0, g:0, b:0 } );
	Ds.SetObjectAttr( buttonName,'borderColor', color );
	
//	Ds.SetObjectAttr( buttonName, 'command', "js play Common/Night Sky Quiz JS/API_sandwich.js|starnumber('"+obj+"','"+category+"','"+buttonName+"',"+stickToggle+","+stickFade+",true)");
	Ds.SetObjectAttr( buttonName, 'command', "js play ./API.js|starnumber('"+obj+"','"+category+"','"+buttonName+"',"+stickToggle+","+stickFade+",true)");
	
}



}	// goodbye!
