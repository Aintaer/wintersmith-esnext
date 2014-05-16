var fs = require('fs');
var path = require('path');
var escompile = require('esnext').compile;
var Transpiler = require('es6-module-transpiler').Compiler;

var formats = {
	'amd': 'toAMD',
	'yui': 'toYUI',
	'cjs': 'toCJS',
	'globals': 'toGlobals'
};

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
			var config = env.config.esnext || {},
			format = formats[config.format || 'globals'],
			transpileConf = env.utils.extend({
				compatFix: true
			}, config.transpilerOptions),
			intermed = escompile(this.content, config.compilerOptions),
			localCompiler = new Transpiler(intermed.code,
										   this.getModulename(config.anonymous),
										   transpileConf);
			callback(null, new Buffer(localCompiler[format]()));
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
