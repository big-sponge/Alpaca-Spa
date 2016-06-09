// alpaca-spa.js
// 2016, ChengCheng ,http://tkc8.com:8080/summary/alpaca-spa.git

var VERSIONMODE_DEVELOPMENT = 1;
var VERSIONMODE_PRODUCT = 2;

var Alpaca = {	
				
		Version:{
			VersionMode: VERSIONMODE_DEVELOPMENT,
			VersionNumber: "1.0.0",						
			update: function(){								
				if(this.VersionMode == VERSIONMODE_DEVELOPMENT){
					localStorage.clear();
				}else{
					var localVersion = localStorage.getItem("localVersion");
					var serverVersion = this.VersionNumber;
					
					console.log("Server Version:"+this.VersionNumber );
					console.log("Local Version:"+localVersion);
					
					if(!localVersion || localVersion != serverVersion ){
						localStorage.clear();
						localStorage.setItem("localVersion",serverVersion);
					}
				}		
				return;
			}
		},
		
		run: function(runHash){
			
			//1.检查版本			
			this.Version.update();
						
			//2.记录当前页面路由					
			var nowHash = window.location.hash;			
			if(!nowHash){ nowHash = ""; }			
			if(!runHash){ runHash = ""; }
						
			//3.执行新的路由(run方法，应用初始路由).
			this.forward(runHash);
			
			//4.之前页面路由与run路由不一样的时候，执行之前路由 (刷新的时候 不跳回主页).
			if(nowHash != runHash){				
				this.forward(nowHash);	
			}
		},
		
		forward:function(inHash){
					 
			//开始路由
			this.Router.start(inHash);
			
			//关闭 或者开启Onhashchange 事件	
			if(window.location.hash != inHash){
				Alpaca.isLoadOnhashchange = false;
			}else{
				Alpaca.isLoadOnhashchange = true;
			}
			
			//设置hash
			if(inHash){
				window.location.hash = inHash;
			}
				
			return true;
		},
		
		Router:{
			
			ModulePostfix:'Module',
			
			ControllerPostfix:'Controller',
			
			ActionPostfix:'Action',
			
			DefaultModule:'index',
			
			DefaultController:'index',
			
			DefaultAction:'index',

			Module:null,
			
			Controller:null,
			
			Action:null,
			
			ModuleName:null,
			
			ControllerName:null,
			
			ActionName:null,
			
			ModuleFullName:null,
			
			ControllerFullName:null,
			
			ActionFullName:null,
			
			Params : new Array(),
									
			start : function(inHash){
	  						
				//解析路由，生成Module、Controller、Action
				var actionName = this.parser(inHash);		    
		    		
				//执行分发之前的事件
				var initResult = this.init();
				if(initResult !== undefined){
					return;		
				}

				//分发-执行Action
				this.dispatcher(actionName);	
				
				//执行分发后的事件
				var releaseResult = this.release();
			 },	
			
			 parser:function(inHash){
				 					
				    if(!inHash) {
				    	inHash="";								    	
					} 	
				      		    
					if(inHash.indexOf("?") != -1){
						inHash = inHash.slice(0,inHash.indexOf("?"));
					}						
					
					console.log(inHash);
				    var segments= new Array(); 
				    
				    segments=inHash.split("/");
				    
				    
				    if(!segments[3]){	    				    	
				    	segments.splice(1, 0, this.DefaultModule); 
				    }
			    	
				    if(!segments[3]){	    				    	
				    	segments.splice(1, 0, this.DefaultController); 
				    }
				    
				    if(!segments[3]){	    				    	
				    	segments.splice(1, 0, this.DefaultController); 
				    }
		    
				    //保存路由中的其他字段到参数
				    this.Params = segments.slice(4);
				    				    
				    // Module
				    this.Module = segments[1];		    
				    this.ModuleName = this.Module + this.ModulePostfix;			    
			    	this.ModuleName = this.ModuleName.replace(/(\w)/,function(v){return v.toUpperCase()});
			    	this.ModuleFullName = "Alpaca."+this.ModuleName;	
			    	
			    	// Controller
				    this.Controller = segments[2];			    
				    this.ControllerName = this.Controller + this.ControllerPostfix;			    
			    	this.ControllerName = this.ControllerName.replace(/(\w)/,function(v){return v.toUpperCase()});
			    	this.ControllerFullName = this.ModuleFullName+"."+this.ControllerName;
			    	
			    	// Action
				    this.Action = segments[3];			    
				    this.ActionName = this.Action + this.ActionPostfix;
				    this.ActionFullName = this.ControllerFullName+"."+this.ActionName;
				    			    
				    console.log(this.ModuleName,this.ControllerName,this.ActionName);
				    
					var alpacaController = "Alpaca.AlpacaModule.AlpacaController";
					
					if(!eval(this.ModuleFullName)){
						actionName =alpacaController+".moduleNotFoundAction";					
					}else if(!eval(this.ControllerFullName)){
						actionName =alpacaController+".controllerNotFoundAction";					
					}else if(!eval(this.ActionFullName)){
						actionName =alpacaController+".actionNotFoundAction";	
					}else{
						actionName = this.ActionFullName;
					}
					
					return actionName;
			 },
			 
			 init:function(){					 
				    //执行模块init方法，如果该方法存在	
				    var moduleResult = undefined;
					if(eval(this.ModuleFullName) && eval(this.ModuleFullName+".init")){
						moduleResult = eval(this.ModuleFullName+".init" +"()");
					}else{
						moduleResult = eval("Alpaca.AlpacaModule.init()");
					}
					
					if(moduleResult !== undefined){						
						return moduleResult;
					}
															
					//执行控制器init方法，如果该方法存在
					var controllerResult= undefined;
					if(eval(this.ModuleFullName) && eval(this.ControllerFullName) && eval(this.ControllerFullName+".init")){						
						controllerResult = eval(this.ControllerFullName+".init" +"()");
					}else{
						controllerResult = eval("Alpaca.AlpacaModule.AlpacaController.init()");
					}
					
					if(controllerResult !== undefined){					
						return controllerResult;
					}	
					
					return undefined;
			 },
			 
			 dispatcher:function(actionName){
				 				 				 			 											
					//执行Action
					var view = eval(actionName +"()");	
																			
					//View
					if(!view){
						if(eval(this.ControllerFullName+".getDefaultView")){
							view = eval(this.ControllerFullName+".getDefaultView" +"(view)");
						}else if(eval(this.ModuleFullName+".getDefaultView")){
							view = eval(this.ModuleFullName+".getDefaultView" +"(view)");
						}else{							
							view = Alpaca.ViewModel.getDefaultView(view);
						}
						
						//View为空直接返回
						if(!view){
							return;
						}
					}
																
					//View - Template
					if(!view.Template){
						if(eval(this.ControllerFullName+".getDefaultViewTemplate")){
							view.Template = eval(this.ControllerFullName+".getDefaultViewTemplate" +"()");
						}else if(eval(this.ModuleFullName+".getDefaultViewTemplate")){
							view.Template = eval(this.ModuleFullName+".getDefaultViewTemplate" +"()");
						}else{							
							view.Template = Alpaca.ViewModel.getDefaultViewTemplate();
						}
					}
					
					
					//View - CaptureTo					
					if(!view.CaptureTo){
						if(eval(this.ControllerFullName+".getDefaultViewCaptureTo")){
							view.CaptureTo = eval(this.ControllerFullName+".getDefaultViewCaptureTo" +"()");
						}else if(eval(this.ModuleFullName+".getDefaultViewCaptureTo")){
							view.CaptureTo = eval(this.ModuleFullName+".getDefaultViewCaptureTo" +"()");
						}else{							
							if(view.UseLayout){	
								view.CaptureTo = Alpaca.ViewModel.getDefaultViewCaptureTo();
							}else{
								view.CaptureTo = Alpaca.ViewModel.getDefaultLayoutCaptureTo();
							}						
						}					
					}
										
					//Layout
					if(view.UseLayout){	
						//Layout
						if(!view.Layout){							
							if(eval(this.ControllerFullName+".getDefaultLayout")){
								view.setLayout(eval(this.ControllerFullName+".getDefaultLayout" +"(view.Layout)"));
							}else if(eval(this.ControllerFullName+".getDefaultLayout")){
								view.setLayout(eval(this.ModuleFullName+".getDefaultLayout" +"(view.Layout)"));
							}else{							
								view.setLayout(Alpaca.ViewModel.getDefaultLayout(view.Layout));
							}							
						}	
						
						//Layout - Template
						if(!view.Layout.Template){							
							if(eval(this.ControllerFullName+".getDefaultLayoutTemplate")){
								view.Layout.Template = eval(this.ControllerFullName+".getDefaultLayoutTemplate" +"()");
							}else if(eval(this.ModuleFullName+".getDefaultLayoutTemplate")){
								view.Layout.Template = eval(this.ModuleFullName+".getDefaultLayoutTemplate" +"()");
							}else{							
								view.Layout.Template = Alpaca.ViewModel.getDefaultLayoutTemplate();
							}												
						}
						
						//Layout- CaptureTo
						if(!view.Layout.CaptureTo){
							if(eval(this.ControllerFullName+".getDefaultLayoutCaptureTo")){
								view.Layout.CaptureTo = eval(this.ControllerFullName+".getDefaultLayoutCaptureTo" +"()");
							}else if(eval(this.ModuleFullName+".getDefaultLayoutCaptureTo")){
								view.Layout.CaptureTo = eval(this.ModuleFullName+".getDefaultLayoutCaptureTo" +"()");
							}else{							
								view.Layout.CaptureTo = Alpaca.ViewModel.getDefaultLayoutCaptureTo();
							}
						}
					}
						
					//执行控制器onDisplay方法，如果该方法存在												
					if(eval(this.ControllerFullName+".onDisplay")){		
						view = eval(this.ControllerFullName+".onDisplay" +"(view)");
					}
					
					//执行模块onDisplay方法，如果该方法存在												
					if(eval(this.ModuleFullName+".onDisplay")){		
						view = eval(this.ControllerFullName+".onDisplay" +"(view)");
					}
							 			 
					//渲染视图
					view.display();
										
			 },
			 			 
			 release:function(){	
				 
					//执行控制器release方法，如果该方法存在		
					if(eval(this.ModuleFullName) && eval(this.ControllerFullName) && eval(this.ControllerFullName+".release")){						
						eval(this.ControllerFullName+".release" +"()");
					}else{
						eval("Alpaca.AlpacaModule.AlpacaController.release()");
					}
					
					//执行模块release方法，如果该方法存在				 
					if(eval(this.ModuleFullName) && eval(this.ModuleFullName+".release")){
						eval(this.ModuleFullName+".release" +"()");
					}else{
						eval("Alpaca.AlpacaModule.release()");
					}
			 },	
			 		
	  },
				
		ViewModel:{
			
			DefaultViewCaptureTo:"#content",
			
			DefaultLayoutCaptureTo :"body",
			
			TemplatePostfix:'html',
			
			getTemplate: function(url){
				var tpl = localStorage.getItem(url);
				if(tpl == null ){		
					htmlobj= $.ajax({
			            type:"POST",
			            url: url,
			            data:"",
			            dataType:"json",
			            async:false
			        });
					
					tpl = htmlobj.responseText;				
					localStorage.setItem(url, tpl);
				}
				return  tpl;	
			},
			
			loadData: function(tpl,data){	
				var interText = doT.template(tpl);				
				return interText(data);
			},
			
			
			getDefaultView:function(view){
				return undefined;
			},	
			
			getDefaultViewCaptureTo:function(){
				return Alpaca.ViewModel.DefaultViewCaptureTo;
			},
				 
			getDefaultViewTemplate:function(){
				return "/" + Alpaca.Router.Module + "/view/" + Alpaca.Router.Controller+ "/" +Alpaca.Router.Action + "."+Alpaca.ViewModel.TemplatePostfix;
			},
					
			getDefaultLayout:function(layout){
				return new View();
			},
				 
			getDefaultLayoutTemplate:function(){
				return "/" + Alpaca.Router.Module + "/view/layout/layout."+Alpaca.ViewModel.TemplatePostfix;
			},
				 
			getDefaultLayoutCaptureTo:function(){
				return Alpaca.ViewModel.DefaultLayoutCaptureTo;
			},
			
			create : function(data){return {
				CaptureTo:null,
				EnableView:true,
				Template:'',
				UseLayout:false, 
				Data:data,
				Layout:null,
				LayoutData: null,
				Children: new Array(),	
				ChildrenData: new Array(),
				getTemplate:Alpaca.ViewModel.getTemplate,
				loadData:Alpaca.ViewModel.loadData,
				
				disableView:function(){
					this.EnableView = false;
					return this;
				},
				
				enableView:function(){
					this.EnableView = true;
					return this;
				},				
								
				setCaptureTo:function(captureTo){
					this.CaptureTo = captureTo;
					return this;
				},
				
				setUseLayout:function(value){
					this.UseLayout = Boolean(value);
					return this;
				},
				
				setTemplate:function(template){			
					this.Template=template;
					return this;
				},
				
				setData:function(data){
					this.Data = data;
					return this;
				},
								
				setLayout:function(layout){
					this.Layout = layout;
					this.Layout.addChild(this);
					return this;
				},
				
				setLayoutData:function(data){
					if(this.Layout){
						this.Layout.setData(data);
					}
					return this;
				},
												
				addChild:function(child, captureTo){

					if(captureTo){
						child.setCaptureTo(captureTo);
					}
					
					this.Children.push(child);
					return this;
				},
				
				setChildData:function(child, data){
					this.Children.push(child);					
					return this;
				},
						
				hasChildren:function(){
					return (0 <(this.Children).length);
				},
				setFuncGetTemplate:function( func ){					
					this.getTemplate = func;
					return this;
				},			
				
				setFuncLoadData:function( func ){					
					this.loadData = func;
					return this;
				},	
				
				render:function(){
					var tpl = this.getTemplate(this.Template);	
					
					var html = this.loadData(tpl,this.Data);						
					$(this.CaptureTo).html(html);
					
					if(this.hasChildren){						
						  for(var index in this.Children){
							  this.Children[index].render();
                          }
					}					
					return;										
				},
				
				display:function(){	
					
					if(!this.EnableView){
						return;
					}
					
					if(this.Layout && this.UseLayout){
						this.Layout.render();						
					}else{
						this.render();
					}					
					return;
				},

				};
			},
		},
				
		AlpacaModule:{
			
			init:function(){	
				console.log("AlpacaModule init");
			},
			
			release:function(){
				console.log("AlpacaModule release");
			},
			
			AlpacaController:{
				
				init:function(){				
					console.log("AlpacaModule AlpacaController init");
				},
				
				release:function(){
					console.log("AlpacaModule AlpacaController release");
				},
				
				indexAction: function(){
					alert("This is index action !");
				},
				
				actionNotFoundAction: function(){
					alert("The action is not found !");				
				},
				
				controllerNotFoundAction: function(){
					alert("The controller is not found !");					
				},
				
				moduleNotFoundAction: function(){
					alert("The module is not found !");				
				},
			},			
		},
		
		IndexModule:{
			IndexController:{
				indexAction: function(){
					document.write("Welcome to use Alpaca SPA.");
				},								
			},			
		},	
		
		isLoadOnhashchange: true,
}

var View = Alpaca.ViewModel.create;




//The following is doT.js
//2011-2014, Laura Doktorova, https://github.com/olado/doT
//Licensed under the MIT license.

(function() {
	"use strict";

	var doT = {
		version: "1.0.3",
		templateSettings: {
			evaluate:    /\{\{([\s\S]+?(\}?)+)\}\}/g,
			interpolate: /\{\{=([\s\S]+?)\}\}/g,
			encode:      /\{\{!([\s\S]+?)\}\}/g,
			use:         /\{\{#([\s\S]+?)\}\}/g,
			useParams:   /(^|[^\w$])def(?:\.|\[[\'\"])([\w$\.]+)(?:[\'\"]\])?\s*\:\s*([\w$\.]+|\"[^\"]+\"|\'[^\']+\'|\{[^\}]+\})/g,
			define:      /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,
			defineParams:/^\s*([\w$]+):([\s\S]+)/,
			conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,
			iterate:     /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,
			varname:	"it",
			strip:		true,
			append:		true,
			selfcontained: false,
			doNotSkipEncoded: false
		},
		template: undefined, //fn, compile template
		compile:  undefined  //fn, for express
	}, _globals;

	doT.encodeHTMLSource = function(doNotSkipEncoded) {
		var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': "&#34;", "'": "&#39;", "/": "&#47;" },
			matchHTML = doNotSkipEncoded ? /[&<>"'\/]/g : /&(?!#?\w+;)|<|>|"|'|\//g;
		return function(code) {
			return code ? code.toString().replace(matchHTML, function(m) {return encodeHTMLRules[m] || m;}) : "";
		};
	};

	_globals = (function(){ return this || (0,eval)("this"); }());

	if (typeof module !== "undefined" && module.exports) {
		module.exports = doT;
	} else if (typeof define === "function" && define.amd) {
		define(function(){return doT;});
	} else {
		_globals.doT = doT;
	}

	var startend = {
		append: { start: "'+(",      end: ")+'",      startencode: "'+encodeHTML(" },
		split:  { start: "';out+=(", end: ");out+='", startencode: "';out+=encodeHTML(" }
	}, skip = /$^/;

	function resolveDefs(c, block, def) {
		return ((typeof block === "string") ? block : block.toString())
		.replace(c.define || skip, function(m, code, assign, value) {
			if (code.indexOf("def.") === 0) {
				code = code.substring(4);
			}
			if (!(code in def)) {
				if (assign === ":") {
					if (c.defineParams) value.replace(c.defineParams, function(m, param, v) {
						def[code] = {arg: param, text: v};
					});
					if (!(code in def)) def[code]= value;
				} else {
					new Function("def", "def['"+code+"']=" + value)(def);
				}
			}
			return "";
		})
		.replace(c.use || skip, function(m, code) {
			if (c.useParams) code = code.replace(c.useParams, function(m, s, d, param) {
				if (def[d] && def[d].arg && param) {
					var rw = (d+":"+param).replace(/'|\\/g, "_");
					def.__exp = def.__exp || {};
					def.__exp[rw] = def[d].text.replace(new RegExp("(^|[^\\w$])" + def[d].arg + "([^\\w$])", "g"), "$1" + param + "$2");
					return s + "def.__exp['"+rw+"']";
				}
			});
			var v = new Function("def", "return " + code)(def);
			return v ? resolveDefs(c, v, def) : v;
		});
	}

	function unescape(code) {
		return code.replace(/\\('|\\)/g, "$1").replace(/[\r\t\n]/g, " ");
	}

	doT.template = function(tmpl, c, def) {
		c = c || doT.templateSettings;
		var cse = c.append ? startend.append : startend.split, needhtmlencode, sid = 0, indv,
			str  = (c.use || c.define) ? resolveDefs(c, tmpl, def || {}) : tmpl;

		str = ("var out='" + (c.strip ? str.replace(/(^|\r|\n)\t* +| +\t*(\r|\n|$)/g," ")
					.replace(/\r|\n|\t|\/\*[\s\S]*?\*\//g,""): str)
			.replace(/'|\\/g, "\\$&")
			.replace(c.interpolate || skip, function(m, code) {
				return cse.start + unescape(code) + cse.end;
			})
			.replace(c.encode || skip, function(m, code) {
				needhtmlencode = true;
				return cse.startencode + unescape(code) + cse.end;
			})
			.replace(c.conditional || skip, function(m, elsecase, code) {
				return elsecase ?
					(code ? "';}else if(" + unescape(code) + "){out+='" : "';}else{out+='") :
					(code ? "';if(" + unescape(code) + "){out+='" : "';}out+='");
			})
			.replace(c.iterate || skip, function(m, iterate, vname, iname) {
				if (!iterate) return "';} } out+='";
				sid+=1; indv=iname || "i"+sid; iterate=unescape(iterate);
				return "';var arr"+sid+"="+iterate+";if(arr"+sid+"){var "+vname+","+indv+"=-1,l"+sid+"=arr"+sid+".length-1;while("+indv+"<l"+sid+"){"
					+vname+"=arr"+sid+"["+indv+"+=1];out+='";
			})
			.replace(c.evaluate || skip, function(m, code) {
				return "';" + unescape(code) + "out+='";
			})
			+ "';return out;")
			.replace(/\n/g, "\\n").replace(/\t/g, '\\t').replace(/\r/g, "\\r")
			.replace(/(\s|;|\}|^|\{)out\+='';/g, '$1').replace(/\+''/g, "");
			//.replace(/(\s|;|\}|^|\{)out\+=''\+/g,'$1out+=');

		if (needhtmlencode) {
			if (!c.selfcontained && _globals && !_globals._encodeHTML) _globals._encodeHTML = doT.encodeHTMLSource(c.doNotSkipEncoded);
			str = "var encodeHTML = typeof _encodeHTML !== 'undefined' ? _encodeHTML : ("
				+ doT.encodeHTMLSource.toString() + "(" + (c.doNotSkipEncoded || '') + "));"
				+ str;
		}
		try {
			return new Function(c.varname, str);
		} catch (e) {
			if (typeof console !== "undefined") console.log("Could not create a template function: " + str);
			throw e;
		}
	};

	doT.compile = function(tmpl, def) {
		return doT.template(tmpl, null, def);
	};
}());

(function(win){
	 
    var hashchange = win.onhashchange, change, //for IE
    loc = location,
    hash = loc.hash,
    delay = 50;
     
    function gethash(hash){
    	return hash.replace(/^#/,"");
    }
    
    win.onhashchange = function(func){
    	if(hashchange){
    		hashchange = function(){
    			func(gethash(loc.hash));
    			}
    	}else{
    		setTimeout(function change(){
    			if(loc.hash !== hash){    				
    				func(gethash(loc.hash));
    				hash = loc.hash;
    			}
    			setTimeout(change, delay);
    			},delay);
    	}
    };
}(window));

window.onhashchange(function(hash){		
	if(Alpaca.isLoadOnhashchange){
	    Alpaca.forward(window.location.hash);
	}
	Alpaca.isLoadOnhashchange =true;
});


//jquery  extend

$.extend({
	 getUrlVars: function(){
	  var vars = [], hash;
	  var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	  for(var i = 0; i < hashes.length; i++)
	  {
	   hash = hashes[i].split('=');
	   vars.push(hash[0]);
	   vars[hash[0]] = decodeURI(hash[1]);
	  }
	  return vars;
	 },
	 getUrlVar: function(name){
	  return $.getUrlVars()[name];
	 }
});
