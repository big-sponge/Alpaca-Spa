Alpaca.IndexModule ={				
		IndexController:{						
			indexAction: function(){					
				return View();
			},		
			
			index2Action: function(){		
				
				var value = $.getUrlVar('value');
				alert(value);
			},	
		},				
};
