// This script is a compiler; it takes all the contents of the
// 		objects file (default 'sample quiz.txt'), analyzes them
//		line-by-line, then updates the quiz's console.

// I expanded the code here to make it easier to read.
//		Originally, there was a condensed version in Common that
//		was smaller, but it wasn't efficient enough to warrant
//		how terrible it was to read.  So please enjoy this one :)


// needs changes to Control Panel if >50
var maxObjects = 50;


// These initialize our variables.
var fileRef,								// Reference for list file.
	currentLine      = 0,					// line number during iteration
	objUsedSoFar     = 0, 					// counts how many objects are added to console
	stickToggle      = false, 				// true = constellation sticks are enabled
	stickFade        = false, 				// true = constellation sticks will fade out after use
	alphabetizeList  = false,				// true = Objects are sorted by Name, false = Objects are stored by type (constellation, direction, etc.)
	categorizeList   = false,				// true = follow constellations with their stars
	listenForCmd     = false,				// is true if current line is input for '!addCommands'
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
	// text on current line
	var lineContents = Ds.FileReadLine(fileRef).replace(/[^\x00-\x7F]/g,'').trim();
	
	// skip if: line is blank, OR starts with "#"
	if( !lineContents[0]  ||  lineContents[0] == '\#' )
		continue;
	
	currentLine++;
	
	// If 2nd character of current line is a '-', it recognizes
	// 		line as a category and updates relavent variables.
	if ( lineContents[1] == '-' )
	{
		listenForDisplay = false;
		listenForOrder   = false;
		listenForCmd     = false;
		
		var category = lineContents[3].toLowerCase();
		last = category;
	}
		// If first character is a '/', it stops reading lines and ends loop.
		else if ( lineContents[0]=='\/' ) break;
		
		// If first character is a '!', it recognizes it as a command and
		// 		searches for known function. If not recognized, prints error.
		else if( lineContents[0] == '\!' )
		{
			listenForDisplay = false;
			listenForOrder   = false;
			listenForCmd     = false;
			
			if( lineContents.slice(1,5) == 'date' )
			{
				print('date set to: \''+ lineContents.slice(6, lineContents.length) +'\'');
				Ds.SendStringCommand('scene date '+ lineContents.slice(6, lineContents.length) +' local');
			}
				else if( lineContents.slice(1,10) == 'stickFade' ) stickFade = true;
				else if( lineContents.slice(1,6) == 'stick' ) stickToggle = true;
				else if( lineContents.slice(1,6) == 'order' ) listenForOrder = true;
				else if( lineContents.slice(1,12) == 'alphabetize' ) alphabetizeList = true;
				else if( lineContents.slice(1,11) == 'addCommand' ) listenForCmd = true;
				else if( lineContents.slice(1,5) == 'info' ) listenForDisplay = true;
				else print('Check your spelling! [line '+currentLine+']');
		}
		
		// If listening for !addCommands, sends current line as Digistar command.
		else if ( listenForCmd )
			Ds.SendStringCommand( lineContents );
		
		// If listening for !info, saves current line as string in infoList.
		else if ( listenForDisplay ) 
			infoList.push( lineContents );
		
		// If listening for !order, saves current line as string in orderList.
		else if ( listenForOrder ) 
			orderList.push( lineContents ); 
		
		// If an object to add, adds current line to objList.
		else
		{
			var objName = lineContents;
			
			objList.push( objName );				// save object
			category__obj[ objName ] = last;		// save keypair object-category so we can lookup category later
			objUsedSoFar++;
		} 

		/*

	--> This Windows API call is sent incorrectly by digistar. 
	--> I eventually need to ask digistar support about PopupMessage() starting minimized to taskbar.	
	
			var stopQuiz = Ds.PopupMessage('Reached max of ' + maxObjects + ' items at line ' + currentLine + ' in list.\n\n--> Press OK to use current items only.\n--> Press CANCEL if necessary items might be excluded.','Continue\?','OKCANCEL','ICONWARNING','TOPMOST');
			if ( stopQuiz == 1 ) break;
			else if ( stopQuiz == 2 )
			{
				objCategories = [];
				break;
			}
			
		*/
}

Ds.FileClose( fileRef );


} catch(err)
{
	throw ('Manual Error Report:\n-> Crashed at line [' + currentLine + '] of txt file;\n-> # of objects imported: ' + objUsedSoFar + ';\n' + err);
}


// Changes order of objects (alphabetize + !order)
if( orderList.length )	// true if we saw !order command
{
	var objListCopy = [];
	
	for (var i=0;  i < orderList.length;  i++)
	{
		var obj = orderList[i];
		
		if( objList.contains( obj ) )
		{
		//	print('saw '+obj+'  ['+orderList.indexOf(obj)+']');
			objListCopy.push(obj);
		}
	}
	
	for (var i=0;  i < objList.length;  i++)
	{
		var obj = objList[i];
		
		if( !objListCopy.contains( obj ) )
		{
		//	print('missing '+obj+'  ['+objList.indexOf(obj)+']');
			objListCopy.push(obj);
		}
	}
	
//	print( orderList );
//	print( objList );
//	print( objListCopy );
//	print('and, alpheratz, m31, aql, saturn, ...');
		
	objList = objListCopy;
	

} else if( alphabetizeList )	// true if !alphabetize was seen
{
	objList = objList.sort();


} else	// didn't see !order or !alphabetize
{
//	objList = objList;
	
}


var colors = {
	'd': [255, 220, 210],		// directions (d) + default
	'c': [255, 246, 204],		// constellations (c)
	's': [240, 172, 117],		// stars (s)
	'm': [232, 112, 95],		// messier
	'o': [247, 114, 105],		// objects (o)
	'p': [63, 118, 196]			// planets (p)
}
var percent = 100/255;

function giveMeColor(category)
{
	if ( colors[category] )
		return {
			'r': percent * colors[category][0],
			'g': percent * colors[category][1],
			'b': percent * colors[category][2]
		};
	else
		return {
			'r': percent * colors.d[0],
			'g': percent * colors.d[1],
			'b': percent * colors.d[2]
		}
}


// This part adds the buttons and applies their properties.
var button = 0;
for (var i=0;  i < objList.length;  i++)
{
	var obj = objList[i];
	button++;
	
	if( button > maxObjects )break;	// quit adding buttons if reached max
	
	var category = category__obj[ obj ];
	var buttonName = 'quizButton' +  (button < 10  ?'0'  :'') + button;
	Ds.CreateObject( buttonName, 'buttonClass' );
	
	var color = giveMeColor(category);
	
	Ds.SetObjectAttr( buttonName,'label', obj );
	Ds.SetObjectAttr( buttonName,'fontsize', 32 );
	Ds.SetObjectAttr( buttonName,'color', color );
	Ds.SetObjectAttr( buttonName,'labelColor', { r:0, g:0, b:0 } );
	Ds.SetObjectAttr( buttonName,'borderColor', color );
	
	Ds.SetObjectAttr( buttonName, 'command', "js play ./API.js|selectObject('" + obj + "','" + category + "','" + buttonName + "'," + stickToggle + "," + stickFade + ",true)");
	
}



}	// Goodbye!
