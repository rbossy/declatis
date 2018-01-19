class Dictionary {
	constructor(name, address) {
		this.name = name;
		this.address = address;
		this._matrix = undefined
		Dictionary.ALL.set(name, this);
	}

	get matrix() {
		if (this._matrix === undefined) {
			this._matrix = new Matrix(this.name, 3);
			this._matrix.addURL(this.address);
		}
		return this._matrix;
	}

	static get(name) {
		if (!Dictionary.ALL.has(name)) {
			throw new Error('unknown dictionary: ' + name);
		}
		return Dictionary.ALL.get(name);
	}
}
Dictionary.ALL = new Map();
Dictionary.PRESETS = [
	new Dictionary('Arabic family names', 'dict/arabic-family-names.utf8'),
	new Dictionary('Arabic female names', 'dict/arabic-female-names.utf8'),
	new Dictionary('Arabic male names', 'dict/arabic-male-names.utf8'),
	new Dictionary('Celtic female names', 'dict/celtic-female-names.utf8'),
	new Dictionary('Celtic male names', 'dict/celtic-male-names.utf8'),
	new Dictionary('Egyptian words', 'dict/egyptian-words.utf8'),
	new Dictionary('English family names', 'dict/english-family-names.utf8'),
	new Dictionary('English female names', 'dict/english-female-names.utf8'),
	new Dictionary('English male names', 'dict/english-male-names.utf8'),
	new Dictionary('English old words', 'dict/english-old-words.utf8'),
	new Dictionary('English words', 'dict/english-words.utf8'),
	new Dictionary('French proper names', 'dict/french-proper-names.utf8'),
	new Dictionary('French words', 'dict/french-words.utf8'),
	new Dictionary('Gothic words', 'dict/gothic-words.utf8'),
	new Dictionary('Greek female names', 'dict/greek-female-names.utf8'),
	new Dictionary('Greek male names', 'dict/greek-male-names.utf8'),
	new Dictionary('Japanese female names', 'dict/japanese-female-names.utf8'),
	new Dictionary('Japanese male names', 'dict/japanese-male-names.utf8'),
	new Dictionary('Sindarin words', 'dict/sindarin-words.utf8'),
	new Dictionary('Swahili words', 'dict/swahili-words.utf8'),
	new Dictionary('Viking female names', 'dict/viking-female-names.utf8'),
	new Dictionary('Viking male names', 'dict/viking-male-names.utf8'),
]
;