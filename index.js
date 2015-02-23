var fs = require('fs');
var path = require('path');
var babel = require('babel');

module.exports = function pluging(env, callback) {
	function EsCompiler(path, content) {
		this.path = path;
		this.content = content;
	}

	EsCompiler.prototype = Object.create(env.ContentPlugin.prototype);
	EsCompiler.prototype.constructor = EsCompiler;
	EsCompiler.prototype.getFilename = function() {
		return this.path.relative;
	};
	EsCompiler.prototype.getModulename = function(anonymous) {
		return anonymous ?
			null :
			env.utils.stripExtension(this.getFilename());
	};
	EsCompiler.prototype.getPluginColor = function() {
		return 'yellow';
	};
	EsCompiler.prototype.getView = function() {
		return function view(env, locals, contents, templates, callback) {
			var config = env.config.babel || {};
			var es6 = babel.transform(this.content, config.compilerOptions);
	
			callback(null, new Buffer(es6));
		};
	};
	EsCompiler.fromFile = function(path, callback) {
		fs.readFile(path.full, function(err, data) {
			var escomp;
			if (!err) {
				escomp = new EsCompiler(path, data.toString());
			}
			callback(err, escomp);
		});
	};

	var config = env.config.esnext || {};
	env.registerContentPlugin('scripts', config.pattern || '**/*.*(js|es)', EsCompiler);
	callback();
};
