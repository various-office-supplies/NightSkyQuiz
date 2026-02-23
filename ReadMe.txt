Hello!

Thank you for downloading the Night Sky Quiz.

The code included here is public domain, created by Ben Kussmann in coordination with
Kevin Healy and James Enos at Mesa Community College.

The "sample quiz.txt" file is an extensive guide on creating quizzes using this
software.  It details every feature, and gives examples for customization.  I would
recommend building your own quizzes by editing copies of this file.


If you want to modify the code, please keep in mind:
	-> Digistar hard-codes URLs, so moving or renaming any scripts will require
	   editing the .dscp control panel file through Digistar.
	-> Ds.SetObjectAttr() sucks. It would sporadically start/stop working, and
	   I have no idea why. I used Ds.SendStringCommand() whenever I had to, and I'd
	   recommend you do the same if adding commands.
	-> DigiStar's version of JavaScript differs a bit from browsers, primarily
	   with shorthand terms. As examples, using 'a--' or '++a' would crash scripts,
	   assigning variables with 'const' and 'let' would usually misfunction, and
	   single/double parenthesis have stricter usage. You've been warned!


That's about it :)