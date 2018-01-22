class Help {
	static startTutorial() {
		Help.tutorial.init();
		Help.tutorial.start(true);
	}
}
Help.tutorial = new Tour({
	storage: false,
	template: '<div class="popover" role="tooltip"> <div class="arrow"></div> <h3 class="popover-header bg-info"></h3> <div class="popover-body"></div> <div class="popover-navigation"> <div class="btn-group"> <button class="btn btn-sm btn-info" data-role="prev">&laquo; Prev</button> <button class="btn btn-sm btn-info" data-role="next">Next &raquo;</button> <button class="btn btn-sm btn-secondary" data-role="pause-resume" data-pause-text="Pause" data-resume-text="Resume">Pause</button> </div> <button class="btn btn-sm btn-info" data-role="end">Skip</button> </div> </div>',
	steps: [
		{
			orphan: true,
			backdrop: true,
			title: 'About déclatis',
			content: '<p>Déclatis is a random word generator. This is either a toy, a branding tool, or a helper for creative minds.</p>'+
			'<p>Déclatis is developed and maintained by <a href="https://github.com/rbossy">Robert Bossy</a>. You can drop bug reports and feature requests by creating issues in the <a href="https://github.com/rbossy/declatis/">GitHub project</a>.</p>'+
			'<p>Déclatis is distributed under the <a href="https://github.com/rbossy/declatis/blob/master/LICENSE">MIT License</a>.</p>'+
			'<p>This user interface uses icons from the <a href="http://www.entypo.com/">Entypo+</a> collection by Daniel Bruce distributed under the CC BY-SA license.</p>',
			template: '<div class="popover" role="tooltip"> <div class="arrow"></div> <h3 class="popover-header bg-info"></h3> <div class="popover-body"></div> <div class="popover-navigation"> <div class="btn-group"> <button class="btn btn-sm btn-info" data-role="next">Tutorial</button> <button class="btn btn-sm btn-secondary" data-role="pause-resume" data-pause-text="Pause" data-resume-text="Resume">Pause</button> </div> <button class="btn btn-sm btn-info" data-role="end">Dismiss</button> </div> </div>',
		},
		{
			element: '#generated-words',
			backdrop: true,
			title: 'Generated words',
			content: '<p>These are the generated words. You can select the ones you like by clicking on them. The icon next to each word gives you access to parameters of the generation algorithm.</p>'
		},
		{
			element: '#btn-export',
			backdrop: true,
			title: 'Export words',
			content: '<p>This button sends selected words to the clipboard, as if they were copied. Then you can paste them in another application.</p>'
		},
		{
			element: '#btn-generate',
			backdrop: true,
			title: 'Generate more words',
			content: '<p>If you are done with the generated words, you may generate more with this button.</p>'
		},
		{
			element: '#current-dictionary',
			backdrop: true,
			title: 'Training dictionary',
			content: '<p>Déclatis generation algorithm requires a training dictionary: the words it generates will look like the words in this dctionary.</p>'+
			'<p>Here you can select the training dictionary among a set common word/name categories.</p>'+
			'<p>Changing the dictionary regenerates another set of words.</p>'
		},
		{
			element: '#k-button-group',
			backdrop: true,
			title: 'Familiarity',
			content: '<p>The generation algorithm can be adjusted through the <em>Familiarity</em> parameter. A low familiarity generates more random words, though they are sometimes a bit off. High familiarity generates words more similar to the dictionary words.</p>'+
			'<p>Changing the familiarity regenerates another set of words.</p>'
		},
		{
			element: '#character-count-slider',
			backdrop: true,
			title: 'Word length',
			content: '<p>This slider controls the minimum and maximum number of characters of generated words.</p>'+
			'<p>Changing the length regenerates another set of words.</p>'
		},
		{
			orphan: true,
			backdrop: true,
			title: 'That\'s it!',
			content: '<p>Enjoy the new words.</p>',
			template: '<div class="popover" role="tooltip"> <div class="arrow"></div> <h3 class="popover-header bg-info"></h3> <div class="popover-body"></div> <div class="popover-navigation"> <div class="btn-group"> <button class="btn btn-sm btn-info" data-role="prev">&laquo; Prev</button> <button class="btn btn-sm btn-info" data-role="next">Next &raquo;</button> <button class="btn btn-sm btn-secondary" data-role="pause-resume" data-pause-text="Pause" data-resume-text="Resume">Pause</button> </div> <button class="btn btn-sm btn-info" data-role="end">Dismiss</button> </div> </div>',
		}
	],
});
