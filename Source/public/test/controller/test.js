Alpaca.TestModule ={			
		IndexController:{			
			
			index1Action: function(){								
				//Hello World
				alert("Hello World!");
			},
						
			index2Action: function(){											
				//使用默认视图模板 与Action同名，路径位于/{模块名}/view/{控制器名}/{方法名}.html
				return new View();
			},
			
			index3Action: function(){							
				//使用默认视图模板并且传递参数 name 到视图模板，在模板中使用{{= it.name}}获取name值。
				return new View({name:'Cheng'});
			},
			
			index3eAction: function(){				
				//使用指定视图模板。
				return new View().setTemplate("/test/view/index/index3other.html");
			},
			
			index4Action: function(){					
				//使用默认视图模板，并且使用默认layout，将当前视图模板写入layout中的"#content"标签中。
				//默认layout模板位于，/{模块名}/view/layout/layout.html
				return new View().
				setUseLayout(true).setCaptureTo("#content");
			},
			
			index5Action: function(){					
				//使用自定义Layout
				return new View().
				setUseLayout(true).
				setCaptureTo("#content").
				setLayout(new View().setTemplate("/test/view/layout/layout2.html"));
			},
			
			index6Action: function(){				
				//使用自定义Layout,不使用默认Layout并且向Layout中传递参数id.
				return new View().
				setUseLayout(true).
				setCaptureTo("#content").
				setLayout(new View().setTemplate("/test/view/layout/layout3.html")).setLayoutData({id:'1000'})
				;
			},	
			
			index7Action: function(){
				 document.write("3 sss.");
			},
					
		},	
		
		Index2Controller:{			
			indexAction: function(){				
				//模板加载到body里面，下面语句成功之后，模板的内容是  $(test1).html()。可以看出 setTemplate中的 #test1 替换了 setFuncGetTemplate中的 id。
				return new View().
				setCaptureTo("body").
				setFuncGetTemplate(function(id){return $(id).html();}).
				setTemplate("#test1");
			},
			
			index2Action: function(){									
				return new View().setCaptureTo("body").setFuncGetTemplate(function(id){return $(id).html();}).setTemplate("#test1");
			},

		},
};
