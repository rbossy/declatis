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
			title: 'About Déclatis',
			content: '<p>Déclatis is a random word generator. This is either a toy, a branding tool, or a helper for creative minds.</p>'+
			'<p>Déclatis is developed and maintained by <a href="https://github.com/rbossy">Robert Bossy</a>. You can drop bug reports and feature requests by creating issues in the <a href="https://github.com/rbossy/declatis/">GitHub project</a>.</p>'+
			'<p>Déclatis is distributed under the <a href="https://github.com/rbossy/declatis/blob/master/LICENSE">MIT License</a>.</p>'+
			'<h4 class="popover-header">Software libraries</h4>'+
			'<p>This user interface is built upon several libraries:</p>'+
			'<ul>'+
			'<li>Base metabolism: <a href="https://jquery.com/">jQuery</a> by the <a href="https://jquery.org/team/">jQuery Foundation</a> [<a href="https://jquery.org/license/">MIT license</a>].</li>'+
			'<li>Layout: <a target="_new" href="http://getbootstrap.com/">Bootstrap</a> by the <a href="https://github.com/orgs/twbs/people">Bootstrap core team</a> [<a href="https://github.com/twbs/bootstrap/blob/master/LICENSE">MIT license</a>].</li>'+
			'<li>Length slider: <a href="XXX">bootstrap-slider</a> by XXX [<a href="XXX">XXX</a>].</li>'+
			'<li>About and tutorial: <a href="http://bootstraptour.com/">Bootstrap Tour</a> by <a href="https://github.com/sorich87">Ulrich Sossou</a> [<a href="https://github.com/sorich87/bootstrap-tour/blob/master/LICENSE">MIT license</a>].</li>'+
			'</ul>'+
			'<h4 class="popover-header">Icons</h4>'+
			'<ul>'+
			'<li><span class="icon-block"></span><span class="icon-check"></span><span class="icon-cycle"></span><span class="icon-export"></span><span class="icon-help"></span><span class="icon-reply"></span>: <a href="http://www.entypo.com/">Entypo+</a> collection by <a href="XXX">Daniel Bruce</a> [<a href="XXX">CC BY-SA license</a>].</li>'+
			'<li><img height="16px" src="images/sort-by-alphabet.svg"><img height="16px" src="images/sort-by-order.svg"><img height="16px" src="images/sort-by-attributes.svg">: <a href="">XXX</a> collection by <a href="XXX">XXX</a> [<a href="XXX">XXX license</a>].</li>'+
			'</ul>',
			template: '<div class="popover" role="tooltip"> <div class="arrow"></div> <h3 class="popover-header bg-info"></h3> <div class="popover-body"></div> <div class="popover-navigation"> <div class="btn-group"><button class="btn btn-sm btn-info" data-role="next">Tutorial</button></div> <button class="btn btn-sm btn-info" data-role="end">Dismiss</button> </div> </div>',
		},
		{
			element: '#container-generated',
			backdrop: true,
			title: 'Generated words',
			content: '<p>These are the generated words.</p>'+
			'<p>Each word has this little chart indicating the score given to the generated word. The score depends on the probability of characters assembled to make the word. A click on this widget summons a detailed account of the word generation.</p>',
		},
		{
			element: '#generated-sort',
			backdrop: true,
			title: 'Sort words',
			content: '<p>Sort words alphabetically, by score (highest to lowest), or number of characters.</p>'
		},
		{
			element: '#container-generated .dismiss-button:first',
			backdrop: true,
			title: 'Dismiss word',
			content: '<p>If a word does not suit your taste or need, you can dismiss it with this button.</p>'
		},
		{
			element: '#container-generated .validate-button:first',
			backdrop: true,
			title: 'Validate word',
			content: '<p>You can put aside a word that you like with this other button.</p>',
			reflex: true
		},
		{
			element: '#generated-do-all',
			backdrop: true,
			title: 'Dismiss or validate all',
			content: '<p>You can dismiss or validate all remaining words. These buttons empty the generated words.</p>'
		},
		{
			element: '#container-validated .word-cell:first',
			backdrop: true,
			title: 'Validated word',
			content: '<p>Validated words are moved on the right panel. You can still look at the details or dismiss it.</p>',
			onShow: function(tour) { Action.validateWord($('.validate-button')[0]); }
		},
		{
			element: '.icon-export',
			backdrop: true,
			title: 'Export validated words',
			content: '<p>This button sends validated words into the clipboard, as if you had selected and copied them. You can then paste the words in another application.</p>'
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
			content: '<p>Déclatis generation algorithm requires a training dictionary: the words it generates will look like the words in this dictionary.</p>'+
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
			element: '#prefix-suffix',
			backdrop: true,
			title: 'Prefix &amp; suffix',
			content: '<p>If you specify a prefix or a suffix, then Déclatis will generate words that start with the prefix and end with the suffix.</p>'+
			'<p>Changing the prefix or the suffix regenerates another set of words.</p>'
		},
		{
			element: '#character-count-slider',
			backdrop: true,
			title: 'Word length',
			content: '<p>This slider controls the minimum and maximum number of characters of generated words, including prefix and suffix.</p>'+
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
