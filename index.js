var fs = require('fs');
var path = require('path');
var escompile = require('esnext').compile;
var Transpiler = require('es6-module-transpiler').Compiler;

module.exports = function pluging(env, callback) {
	function EsCompiler(path, content, config) {
		this.path = path;
		this.content = content;
	}

	EsCompiler.prototype = Object.create(env.ContentPlugin);
	EsCompiler.prototype.constructor = EsCompiler;
	EsCompiler.prototype.getFilename = function() {
		return this.path.relative;
	};
	EsCompiler.prototype.getModulename = function() {
		return env.utils.stripExtension(this.getFilename());
	};
	EsCompiler.prototype.getView = function(env, locals, contents, templates, callback) {
		var conf = env.config.esnext || {},
		transpileConf = env.utils.extend({
			compatFix: true
		}, conf.transpilerOptions),
		intermed = escompile(this.content, conf.compilerOptions),
		localCompiler = new Transpiler(intermed.code, this.getModulename(), transpileConf);
		return callback(null, new Buffer(localCompiler.toAMD()));
	};

	EsCompiler.fromFile = function(path, callback) {
		fs.readFile(path, function(err, data) {
			var escomp;
			if (!err) {
				escomp = new EsCompiler(path, data.toString());
			}
			callback(err, escomp);
		});
	};

	env.registerContentPlugin('scripts', '**/*.(js|es)', EsCompiler);
	callback();
};
