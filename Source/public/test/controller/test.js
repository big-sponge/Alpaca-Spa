Alpaca.TestModule ={				
		IndexController:{									
			index1Action: function(){	
							
				//hello World
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
				return new View().setUseLayout(true).setCaptureTo("#content");
			},
			
			index5Action: function(){	
				
				//使用自定义Layout
				return new View().setUseLayout(true).
				setCaptureTo("#content").
				setLayout(new View().setTemplate("/test/view/layout/layout2.html"));
			},
			
			index6Action: function(){
				
				//使用自定义Layout,并且向Layout中传递参数id.
				return new View().setUseLayout(true).
				setCaptureTo("#content").
				setLayout(new View().setTemplate("/test/view/layout/layout3.html")).
				setLayoutData({id:'1000'})
				;
			},			
		},	
		
		Index2Controller:{	
			
			indexAction: function(){									
				return new View().setUseLayout(true).setLayout(new View()).setLayoutData({id:'1000'});
			},
						
			getDefaultLayoutTemplate: function(){
				
				return "/test/view/layout/layout3.html";
			}
		},
};
