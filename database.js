/*
* Matthew Toro
* CS340 Introduction to Databases
* Due Date: 8/18/2017
* Description: Final Project
*/

// set up node.js
var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');

var mysql = require('./dbcon.js');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 22725);

// set up global queries and a global context object for data persistence
var context = {};
var bgSelectionQuery = "SELECT id, name, age_requirement, playing_time, max_players, artist, year_published FROM boardgames ORDER BY name";
var dSelectionQuery = "SELECT id, name, country FROM designers ORDER BY name";
var pSelectionQuery = "SELECT id, name, country, website FROM publishers ORDER BY name";
var mSelectionQuery = "SELECT id, mechanism FROM mechanisms ORDER BY mechanism";
var bgdSelectionQuery = "SELECT bg_id, d_id, boardgames.name AS bg_name, designers.name AS d_name FROM bg_designers AS BGD "+
	"INNER JOIN boardgames ON boardgames.id = BGD.bg_id "+
	"INNER JOIN designers ON designers.id = BGD.d_id "+
	"ORDER BY designers.name, boardgames.name";	
var bgpSelectionQuery = "SELECT bg_id, p_id, boardgames.name AS bg_name, publishers.name AS p_name FROM bg_publishers AS BGP "+
	"INNER JOIN boardgames ON boardgames.id = BGP.bg_id "+
	"INNER JOIN publishers ON publishers.id = BGP.p_id "+
	"ORDER BY publishers.name, boardgames.name";	
var bgmSelectionQuery = "SELECT bg_id, m_id, boardgames.name AS bg_name, mechanisms.mechanism AS m_name FROM bg_mechanisms AS BGM "+
	"INNER JOIN boardgames ON boardgames.id = BGM.bg_id "+
	"INNER JOIN mechanisms ON mechanisms.id = BGM.m_id "+
	"ORDER BY boardgames.name, mechanisms.mechanism";	
var dpSelectionQuery = "SELECT d_id, p_id, publishers.name AS p_name, designers.name AS d_name FROM designers_publishers AS DP "+
	"INNER JOIN designers ON designers.id = DP.d_id "+
	"INNER JOIN publishers ON publishers.id = DP.p_id "+
	"ORDER BY publishers.name, designers.name";	

// get the main page
app.get('/', function(req, res, next){
	res.render('tables', context);
});

// get the board game table page
app.get('/boardgames', function(req, res, next)
{
	mysql.pool.query(bgSelectionQuery, function(err, rows, fields)
	{
		if(err)
		{
			next(err);
			return;
		}
		context.bg_array = rows;
		context.bg_length = rows.length;
		mysql.pool.query(bgdSelectionQuery, function(err, rows, fields)
		{
			if(err)
			{
				next(err);
				return;
			}
			context.bgd_array = rows;
			context.bgd_length = rows.length;
			mysql.pool.query(bgpSelectionQuery, function(err, rows, fields)
			{
				if(err)
				{
					next(err);
					return;
				}
				context.bgp_array = rows;
				context.bgp_length = rows.length;
				mysql.pool.query(bgmSelectionQuery, function(err, rows, fields)
				{
					if(err)
					{
						next(err);
						return;
					}
					context.bgm_array = rows;
					context.bgm_length = rows.length;
					mysql.pool.query("SELECT DISTINCT year_published FROM boardgames", function(err, rows, fields)
					{
						if(err)
						{
							next(err);
							return;
						}
						context.bg_yearArray = rows;
						context.bg_yearLength = rows.length;
						res.render('boardgames', context);
					});
				});
			});
		});
	});
});

// get the designers table page
app.get('/designers', function(req, res, next)
{
	mysql.pool.query(dSelectionQuery, function(err, rows, fields)
	{
		if(err)
		{
			next(err);
			return;
		}
		context.d_array = rows;
		context.d_length = rows.length;
		mysql.pool.query(bgdSelectionQuery, function(err, rows, fields)
		{
			if(err)
			{
				next(err);
				return;
			}
			context.bgd_array = rows;
			context.bgd_length = rows.length;
			mysql.pool.query(dpSelectionQuery, function(err, rows, fields)
			{
				if(err)
				{
					next(err);
					return;
				}
				context.dp_array = rows;
				context.dp_length = rows.length;
				res.render('designers', context);
			});
		});
	});
	
});

// get the publishers table page
app.get('/publishers', function(req, res, next)
{
	mysql.pool.query(pSelectionQuery, function(err, rows, fields)
	{
		if(err)
		{
			next(err);
			return;
		}
		context.p_array = rows;
		context.p_length = rows.length;
		mysql.pool.query(bgpSelectionQuery, function(err, rows, fields)
		{
			if(err)
			{
				next(err);
				return;
			}
			context.bgp_array = rows;
			context.bgp_length = rows.length;
			mysql.pool.query(dpSelectionQuery, function(err, rows, fields)
			{
				if(err)
				{
					next(err);
					return;
				}
				context.dp_array = rows;
				context.dp_length = rows.length;
				res.render('publishers', context);
			});
		});
	});
});

// get the mechanisms table page
app.get('/mechanisms', function(req, res, next)
{
	mysql.pool.query(mSelectionQuery, function(err, rows, fields)
	{
		if(err)
		{
			next(err);
			return;
		}
		context.m_array = rows;
		context.m_length = rows.length;
		mysql.pool.query(bgmSelectionQuery, function(err, rows, fields)
		{
			if(err)
			{
				next(err);
				return;
			}
			context.bgm_array = rows;
			context.bgm_length = rows.length;
			res.render('mechanisms', context);
		});
	});
	
});

// get the update page
app.get('/update', function (req, res, next)
{
	var bgUpdateSelectionQuery = "SELECT id, name, age_requirement, playing_time, max_players, artist, year_published "+
	"FROM boardgames WHERE id=?";
	
	mysql.pool.query(bgUpdateSelectionQuery, [req.query.id], function(err, rows, fields)
	{
		if (err)
		{
			console.log(err);
			next(err);
			return;
		}
		context.update_name = rows[0].name;
		context.update_age = rows[0].age_requirement;
		context.update_time = rows[0].playing_time;
		context.update_players = rows[0].max_players;
		context.update_artist = rows[0].artist
		context.update_year = rows[0].year_published;
		context.update_id = rows[0].id;
		res.render('update', context);
	});
});

// test page used to delete every table
app.get('/delete-table',function(req,res,next)
{
	mysql.pool.query("DROP TABLE bg_designers", function(err)
	{
		mysql.pool.query("DROP TABLE bg_publishers", function(err)
		{
			mysql.pool.query("DROP TABLE designers_publishers", function(err)
			{
				mysql.pool.query("DROP TABLE bg_mechanisms", function(err)
				{
					mysql.pool.query("DROP TABLE boardgames", function(err)
					{
						mysql.pool.query("DROP TABLE designers", function(err)
						{
							mysql.pool.query("DROP TABLE publishers", function(err)
							{
								mysql.pool.query("DROP TABLE mechanisms", function(err)
								{
									res.render('home');
								});
							});
						});
					});
				});
			});
		});
	});
});

// page used to create tables
app.get('/create-table',function(req,res,next)
{
	var createBGTable = "CREATE TABLE boardgames("+
	"id INT PRIMARY KEY AUTO_INCREMENT NOT NULL, "+
	"name VARCHAR(255) NOT NULL, "+
	"age_requirement INT, "+
	"playing_time INT, "+
	"max_players INT, "+
	"artist VARCHAR(255), "+
	"year_published YEAR NOT NULL, "+
	"CONSTRAINT UNIQUE (name))";
	
	var createDesignerTable = "CREATE TABLE designers("+
	"id INT PRIMARY KEY AUTO_INCREMENT NOT NULL, "+
	"name VARCHAR(255) NOT NULL, "+
	"country VARCHAR(255), " +
	"CONSTRAINT UNIQUE (name))";
	
	var createPublisherTable = "CREATE TABLE publishers("+
	"id INT PRIMARY KEY AUTO_INCREMENT NOT NULL, "+
	"name VARCHAR(255) NOT NULL, "+
	"country VARCHAR(255), "+
	"website VARCHAR(255), " +
	"CONSTRAINT UNIQUE (name))";
	
	var createMechanismTable = "CREATE TABLE mechanisms("+
	"id INT PRIMARY KEY AUTO_INCREMENT NOT NULL, "+
	"mechanism VARCHAR(255) NOT NULL, " +
	"CONSTRAINT UNIQUE (mechanism))";
	
	var createBGDesignerTable = "CREATE TABLE bg_designers("+
	"d_id INT, "+
	"bg_id INT, "+
	"PRIMARY KEY (d_id, bg_id), "+
	"CONSTRAINT FOREIGN KEY (d_id) REFERENCES designers (id) ON DELETE CASCADE ON UPDATE CASCADE, "+
	"CONSTRAINT FOREIGN KEY (bg_id) REFERENCES boardgames (id) ON DELETE CASCADE ON UPDATE CASCADE)";
	
	var createBGPublisherTable = "CREATE TABLE bg_publishers("+
	"p_id INT, "+
	"bg_id INT, "+
	"PRIMARY KEY (p_id, bg_id), "+
	"CONSTRAINT FOREIGN KEY (p_id) REFERENCES publishers (id) ON DELETE CASCADE ON UPDATE CASCADE, "+
	"CONSTRAINT FOREIGN KEY (bg_id) REFERENCES boardgames (id) ON DELETE CASCADE ON UPDATE CASCADE)";
	
	var createDesignerPublisherTable = "CREATE TABLE designers_publishers("+
	"d_id INT, "+
	"p_id INT, "+
	"PRIMARY KEY (d_id, p_id), "+
	"CONSTRAINT FOREIGN KEY (d_id) REFERENCES designers (id) ON DELETE CASCADE ON UPDATE CASCADE, "+
	"CONSTRAINT FOREIGN KEY (p_id) REFERENCES publishers (id) ON DELETE CASCADE ON UPDATE CASCADE)";
	
	var createBGMechanismTable = "CREATE TABLE bg_mechanisms("+
	"m_id INT, "+
	"bg_id INT, "+
	"PRIMARY KEY (m_id, bg_id), "+
	"CONSTRAINT FOREIGN KEY (m_id) REFERENCES mechanisms (id) ON DELETE CASCADE ON UPDATE CASCADE, "+
	"CONSTRAINT FOREIGN KEY (bg_id) REFERENCES boardgames (id) ON DELETE CASCADE ON UPDATE CASCADE)";
	mysql.pool.query(createBGTable, function(err)
	{
		mysql.pool.query(createDesignerTable, function(err)
		{
			mysql.pool.query(createPublisherTable, function(err)
			{
				mysql.pool.query(createMechanismTable, function(err)
				{
					mysql.pool.query(createBGDesignerTable, function(err)
					{
						mysql.pool.query(createBGPublisherTable, function(err)
						{
							mysql.pool.query(createDesignerPublisherTable, function(err)
							{
								mysql.pool.query(createBGMechanismTable, function(err)
								{
								});
							});
						});	
					});	
				});	
			});	
		});	
		
	});

	res.render('home');
});

// test page used to add data to tables
app.get('/add_data', function(req, res, next)
{
	var bgAddQuery = "INSERT INTO boardgames (`name`, `age_requirement`, `playing_time`, `max_players`, `artist`, `year_published`) VALUES " +
	"('Agricola', 12, 120, 4, 'Klemens Franz', 2007), " +
	"('Caverna', 12, 210, 7, 'Klemens Franz', 2013), " +
	"('Brass: Lancashire', 14, 180, 4, 'Damian Mammoliti', 2017), " +
	"('The Castles of Burgundy', 12, 90, 4, 'Julien Delval', 2011), " +
	"('Trajan', 12, 120, 4, 'Jo Hartwig', 2011), " +
	"('Puerto Rico', 12, 150, 5, 'Harald Lieske', 2002), " +
	"('Castles of Mad King Ludwig', 13, 90, 4, 'Keith Curtis', 2014), " +
	"('Dixit', 6, 30, 6, 'Marie Cardouat', 2008), " +
	"('Dead of Winter', 14, 210, 5, 'David Richards', 2014), " +
	"('Yokohama', 12, 90, 4, 'Ryo Nyamo', 2016), " +
	"('The Gallerist', 13, 150, 4, 'Ian OToole', 2015), " + 
	"('Imperial Settlers', 10, 90, 4, 'Tomasz Jedrusek', 2014), " + 
	"('Codenames', 14, 15, 8, 'Stephane Gantiez', 2015), " + 
	"('Porta Nigra', 12, 120, 4, 'Michael Menzel', 2015), " + 
	"('Queens Architect', 10, 60, 4, 'Dennis Lohausen', 2015), " + 
	"('Viticulture', 13, 90, 6, 'Jacqui Davis', 2012), " + 
	"('Scythe', 14, 115, 5, 'Jakub Rozalski', 2016)";
	
	var dAddQuery = "INSERT INTO designers (`name`, `country`) VALUES "+
	"('Uwe Rosenberg', 'Germany'), " +
	"('Martin Wallace', 'United Kingdom'), " +
	"('Stefan Feld', 'Germany'), " +
	"('Andreas Seyfarth', 'Germany'), " + 
	"('Ted Alspach', 'United States'), " + 
	"('Jean-Louis Roubira', 'France'), " + 
	"('Jonathan Gilmour', 'United States'), " + 
	"('Isaac Vega', 'United States'), " + 
	"('Hisashi Hayashi', 'Japan'), " +
	"('Vital Lacerda', 'Portugal'), " +
	"('Ignacy Trzewiczek', 'Poland'), " +
	"('Vlaada Chvatil', 'Czech Republic'), " +
	"('Michael Kiesling', 'Germany'), " +
	"('Wolfgang Kramer', 'Germany'), " +
	"('Volker Schachtele', 'Germany'), " +
	"('Jamey Stegmaier', 'United States')"; 
	
	var pAddQuery = "INSERT INTO publishers (`name`, `country`, `website`) VALUES " +
	"('Z-Man Games', 'United States', 'www.zmangames.com'),  " +
	"('Mayfair Games', 'United States', 'www.mayfairgames.com'),  " +
	"('Roxley Games', 'Canada', 'www.roxley.com'),  " +
	"('HUCH!', 'Germany', 'www.hutter-trade.com'),  " +
	"('Ravensburger', 'Germany', 'www.ravensburger.com'),  " +
	"('Bezier Games', 'United States', 'www.beziergames.com'),  " +
	"('Libellud', 'France', 'www.libellud.com'),  " +
	"('Plaid Hat Games', 'United States', 'www.plaidhatgames.com'),  " +
	"('OKAZU Brand', 'Japan', 'www.okazubrand.seesaa.net'),  " +
	"('Tasty Minstrel Games', 'United States', 'www.playtmg.com'), " +
	"('Eagle-Gryphon Games', 'United States', 'www.eaglegames.net'),  " +
	"('Stronghold Games', 'United States', 'www.strongholdgames.com'),  " +
	"('Queen Games', 'Germany', 'www.queengames.com'), " +
	"('Portal Games', 'Poland', 'www.portalgames.pl'),  " +
	"('Czech Games Edition', 'Czech Republic', 'www.czechgames.com'), " +
	"('Stonemaier Games', 'United States', 'www.stonemaiergames.com')";
	
	var mAddQuery = "INSERT INTO mechanisms (`mechanism`) VALUES" +
	"('Worker Placement'), " + 
	"('Tile Placement'), " + 
	"('Card Drafting'), " + 
	"('Hand Management'), " + 
	"('Dice Rolling'), " + 
	"('Set Collection'), " + 
	"('Route Building'), " + 
	"('Variable Phase Order'), " + 
	"('Pattern Building'), " + 
	"('Voting'), " + 
	"('Area Movement'), " + 
	"('Storytelling'), " + 
	"('Co-operative Play'), " +
	"('Grid Movement'), " +
	"('Modular Board'), " +
	"('Commodity Speculation'), " +
	"('Memory'), " +	
	"('Press Your Luck'), " +	
	"('Pattern Recognition'), " +	
	"('Variable Player Powers'), " +	
	"('Area Control')";
	
	mysql.pool.query(bgAddQuery, function(err, result)
	{
		mysql.pool.query(dAddQuery, function(err, result)
		{
			mysql.pool.query(pAddQuery, function(err, result)
			{
				mysql.pool.query(mAddQuery, function(err, result)
				{
				});
			});
		});
	});
	res.render('home');
});

// post to main page, currently does nothing
app.post('/', function(req, res, next)
{

});

// post to /boardgames handles adds, updates, deletes, and filters
app.post('/boardgames', function(req, res, next)
{
	if (req.body.submit != undefined)	
	{	
		switch(req.body.submit)
		{
			case "bg_add":
			{
				var array = [req.body.bg_name, req.body.bg_age, req.body.bg_time, req.body.bg_max, req.body.bg_artist, req.body.bg_year];
				mysql.pool.query("INSERT INTO boardgames (`name`, `age_requirement`, `playing_time`, `max_players`, `artist`, `year_published`) VALUES (?, ?, ?, ?, ?, ?)", array, function(err, result)
				{
					if (err)
					{
						next(err);
						return;
					}
					mysql.pool.query(bgSelectionQuery, function(err, rows, fields)
					{
						if(err)
						{
							next(err);
							return;
						}
						context.bg_array = rows;
						context.bg_length = rows.length;
						mysql.pool.query("SELECT DISTINCT year_published FROM boardgames", function(err, rows, fields)
						{
							if(err)
							{
								next(err);
								return;
							}
							context.bg_yearArray = rows;
							context.bg_yearLength = rows.length;
							res.render('boardgames', context);
						});
					});
				});
				break;
			}
			case "bgd_add":
			{
				var bgdArray = [req.body.bg_name, req.body.d_name];
				var bgdInsertionQuery = "INSERT INTO bg_designers(`bg_id`, `d_id`) VALUES " +
				"((SELECT id from boardgames WHERE name=?), (SELECT id FROM designers WHERE name=?))";
				mysql.pool.query(bgdInsertionQuery, bgdArray, function(err, result)
				{
					if(err)
					{
						next(err);
						return;
					}
					mysql.pool.query(bgdSelectionQuery, function(err, rows, fields)
					{
						if(err)
						{
							next(err);
							return;
						}
						context.bgd_array = rows;
						context.bgd_length = rows.length;
						res.render('boardgames', context);
					});
					
				});
				break;
			}
			case "bgp_add":
			{
				var bgpArray = [req.body.bg_name, req.body.p_name];
				var bgpInsertionQuery = "INSERT INTO bg_publishers(`bg_id`, `p_id`) VALUES " +
				"((SELECT id from boardgames WHERE name=?), (SELECT id FROM publishers WHERE name=?))";
				mysql.pool.query(bgpInsertionQuery, bgpArray, function(err, result)
				{
					if(err)
					{
						next(err);
						return;
					}
					mysql.pool.query(bgpSelectionQuery, function(err, rows, fields)
					{
						if(err)
						{
							next(err);
							return;
						}
						context.bgp_array = rows;
						context.bgp_length = rows.length;
						res.render('boardgames', context);
					});
					
				});
				break;
			}
			case "bgm_add":
			{
				var bgmArray = [req.body.bg_name, req.body.m_mechanism];
				var bgmInsertionQuery = "INSERT INTO bg_mechanisms(`bg_id`, `m_id`) VALUES " +
				"((SELECT id from boardgames WHERE name=?), (SELECT id FROM mechanisms WHERE mechanism=?))";
				mysql.pool.query(bgmInsertionQuery, bgmArray, function(err, result)
				{
					if(err)
					{
						next(err);
						return;
					}
					mysql.pool.query(bgmSelectionQuery, function(err, rows, fields)
					{
						if(err)
						{
							next(err);
							return;
						}
						context.bgm_array = rows;
						context.bgm_length = rows.length;
						res.render('boardgames', context);
					});
					
				});
				break;
			}
			case "delete":
			{
				var array = [req.body.bg_id];
				mysql.pool.query("DELETE FROM boardgames WHERE id = ?", array, function(err)
				{
					if (err)
					{
						next(err);
						return;
					}
					mysql.pool.query(bgSelectionQuery, function(err, rows, fields)
					{
						if(err)
						{
							next(err);
							return;
						}
						context.bg_array = rows;
						context.bg_length = rows.length;
						mysql.pool.query("SELECT DISTINCT year_published FROM boardgames", function(err, rows, fields)
						{
							if(err)
							{
								next(err);
								return;
							}
							context.bg_yearArray = rows;
							context.bg_yearLength = rows.length;
							mysql.pool.query(bgdSelectionQuery, function(err, rows, fields)
							{
								if(err)
								{
									next(err);
									return;
								}
								context.bgd_array = rows;
								context.bgd_length = rows.length;
								mysql.pool.query(bgpSelectionQuery, function(err, rows, fields)
								{
									if(err)
									{
										next(err);
										return;
									}
									context.bgp_array = rows;
									context.bgp_length = rows.length;
									mysql.pool.query(bgmSelectionQuery, function(err, rows, fields)
									{
										if(err)
										{
											next(err);
											return;
										}
										context.bgm_array = rows;
										context.bgm_length = rows.length;
										res.render('boardgames', context);
									});
								});
							});
						});
					});
				});
				
				break;
			}
			case "bgm_delete":
			{
				var array = [req.body.bg_id, req.body.m_id];
				mysql.pool.query("DELETE FROM bg_mechanisms WHERE bg_id = ? AND m_id = ?", array, function(err)
				{
					if (err)
					{
						next(err);
						return;
					}
					mysql.pool.query(bgmSelectionQuery, function(err, rows, fields)
					{
						if(err)
						{
							next(err);
							return;
						}
						context.bgm_array = rows;
						context.bgm_length = rows.length;
						res.render('boardgames', context);
					});
				});
				break;
			}
			case "edit":
			{
				var bgID = req.body.bg_id;
				var redirectionURL = 'http://flip3.engr.oregonstate.edu:22725/update/?id=' + bgID;
				res.redirect(redirectionURL);
				break;
			}
			case "bg_filter":
			{
				if (req.body.type == "less")
				{
					var bgLTFilterQuery = "SELECT id, name, age_requirement, playing_time, max_players, artist, year_published FROM boardgames WHERE year_published < ? ORDER BY name";
					var LTArray = [req.body.bg_year];
					mysql.pool.query(bgLTFilterQuery, LTArray, function(err, rows, fields)
					{
						if (err)
						{
							next(err);
							return;
						}
						context.bg_filteredArray = rows;
						context.bg_filteredLength = rows.length;
						context.filtered = 1;
						res.render('boardgames', context);
					});
				}
				else if (req.body.type == "greater")
				{
					var bgGTFilterQuery = "SELECT id, name, age_requirement, playing_time, max_players, artist, year_published FROM boardgames WHERE year_published > ? ORDER BY name";
					var GTArray = [req.body.bg_year];
					mysql.pool.query(bgGTFilterQuery, GTArray, function(err, rows, fields)
					{
						if (err)
						{
							next(err);
							return;
						}
						context.bg_filteredArray = rows;
						context.bg_filteredLength = rows.length;
						context.filtered = 1;
						res.render('boardgames', context);
					});
				}
				break;
			}
			case "bg_unfilter":
			{
				mysql.pool.query(bgSelectionQuery, function(err, rows, fields)
				{
					if (err)
					{
						next(err);
						return;
					}
					context.bg_array = rows;
					context.bg_length = rows.length;
					context.filtered = 0;
					res.render('boardgames', context);
				});
				break;
			}

		}
	}
	
});

// post to /designers handles adds
app.post('/designers', function(req, res, next)
{
	if (req.body.submit != undefined)	
	{	
		switch(req.body.submit)
		{
			case "d_add":
			{
				var array = [req.body.d_name, req.body.d_country];
				mysql.pool.query("INSERT INTO designers (`name`, `country`) VALUES (?, ?)", array, function(err, result)
				{
					if (err)
					{
						next(err);
						return;
					}
					mysql.pool.query(dSelectionQuery, function(err, rows, fields)
					{
						if(err)
						{
							next(err);
							return;
						}
						context.d_array = rows;
						context.d_length = rows.length;
						res.render('designers', context);
					});
				});
				break;
			}
			case "pd_add":
			{
				var pdArray = [req.body.p_name, req.body.d_name];
				var pdInsertionQuery = "INSERT INTO designers_publishers(`p_id`, `d_id`) VALUES " +
				"((SELECT id from publishers WHERE name=?), (SELECT id FROM designers WHERE name=?))";
				mysql.pool.query(pdInsertionQuery, pdArray, function(err, result)
				{
					if(err)
					{
						next(err);
						return;
					}
					mysql.pool.query(dpSelectionQuery, function(err, rows, fields)
					{
						if(err)
						{
							next(err);
							return;
						}
						context.dp_array = rows;
						context.dp_length = rows.length;
						res.render('designers', context);
					});
					
				});
				break;
			}
			case "bgd_add":
			{
				var bgdArray = [req.body.bg_name, req.body.d_name];
				var bgdInsertionQuery = "INSERT INTO bg_designers(`bg_id`, `d_id`) VALUES " +
				"((SELECT id from boardgames WHERE name=?), (SELECT id FROM designers WHERE name=?))";
				mysql.pool.query(bgdInsertionQuery, bgdArray, function(err, result)
				{
					if(err)
					{
						next(err);
						return;
					}
					mysql.pool.query(bgdSelectionQuery, function(err, rows, fields)
					{
						if(err)
						{
							next(err);
							return;
						}
						context.bgd_array = rows;
						context.bgd_length = rows.length;
						res.render('designers', context);
					});
				});
				break;
			}
		}
	}	
});


// post to /publishers handles adds
app.post('/publishers', function(req, res, next)
{
		switch(req.body.submit)
	{
		case "p_add":
		{
			var array = [req.body.p_name, req.body.p_country, req.body.p_website];
			mysql.pool.query("INSERT INTO publishers (`name`, `country`, `website`) VALUES (?, ?, ?)", array, function(err, result)
			{
				if (err)
				{
					next(err);
					return;
				}
				
				mysql.pool.query(pSelectionQuery, function(err, rows, fields)
				{
					if(err)
					{
						next(err);
						return;
					}
					context.p_array = rows;
					context.p_length = rows.length;
					res.render('publishers', context);
				});
			});
			break;
		}
		case "pd_add":
		{
			var pdArray = [req.body.p_name, req.body.d_name];
			var pdInsertionQuery = "INSERT INTO designers_publishers(`p_id`, `d_id`) VALUES " +
			"((SELECT id from publishers WHERE name=?), (SELECT id FROM designers WHERE name=?))";
			mysql.pool.query(pdInsertionQuery, pdArray, function(err, result)
			{
				if(err)
				{
					next(err);
					return;
				}
				mysql.pool.query(dpSelectionQuery, function(err, rows, fields)
				{
					if(err)
					{
						next(err);
						return;
					}
					context.dp_array = rows;
					context.dp_length = rows.length;
					res.render('publishers', context);
				});
				
			});
			break;
		}
		case "bgp_add":
		{
			var bgpArray = [req.body.bg_name, req.body.p_name];
			var bgpInsertionQuery = "INSERT INTO bg_publishers(`bg_id`, `p_id`) VALUES " +
			"((SELECT id from boardgames WHERE name=?), (SELECT id FROM publishers WHERE name=?))";
			mysql.pool.query(bgpInsertionQuery, bgpArray, function(err, result)
			{
				if(err)
				{
					next(err);
					return;
				}
				mysql.pool.query(bgpSelectionQuery, function(err, rows, fields)
				{
					if(err)
					{
						next(err);
						return;
					}
					context.bgp_array = rows;
					context.bgp_length = rows.length;
					res.render('publishers', context);
				});	
			});
			break;
		}
	}
});


// post to mechanisms handles adds
app.post('/mechanisms', function(req, res, next)
{
	switch(req.body.submit)
	{
		case "m_add":
		{
			var array = [req.body.m_mechanism];
			mysql.pool.query("INSERT INTO mechanisms (`mechanism`) VALUES (?)", array, function(err, result)
			{
				if (err)
				{
					next(err);
					return;
				}
				mysql.pool.query(mSelectionQuery, function(err, rows, fields)
				{
					if(err)
					{
						next(err);
						return;
					}
					context.m_array = rows;
					context.m_length = rows.length;
					res.render('mechanisms', context);
				});
			});
			break;
		}
		case "bgm_add":
		{
			var bgmArray = [req.body.bg_name, req.body.m_mechanism];
			var bgmInsertionQuery = "INSERT INTO bg_mechanisms(`bg_id`, `m_id`) VALUES " +
			"((SELECT id from boardgames WHERE name=?), (SELECT id FROM mechanisms WHERE mechanism=?))";
			mysql.pool.query(bgmInsertionQuery, bgmArray, function(err, result)
			{
				if(err)
				{
					next(err);
					return;
				}
				mysql.pool.query(bgmSelectionQuery, function(err, rows, fields)
				{
					if(err)
					{
						next(err);
						return;
					}
					context.bgm_array = rows;
					context.bgm_length = rows.length;
					res.render('mechanisms', context);
				});
				
			});
			break;
		}
		case "bgm_delete":
		{
			var array = [req.body.bg_id, req.body.m_id];
			mysql.pool.query("DELETE FROM bg_mechanisms WHERE bg_id = ? AND m_id = ?", array, function(err)
			{
				if (err)
				{
					next(err);
					return;
				}
				mysql.pool.query(bgmSelectionQuery, function(err, rows, fields)
				{
					if(err)
					{
						next(err);
						return;
					}
					context.bgm_array = rows;
					context.bgm_length = rows.length;
					res.render('mechanisms', context);
				});
			});
			break;
		}
	}
});

// post to /update handles updating data
app.post('/update', function (req, res, next)
{
	if(req.body.submit == "bg_update")
	{
		var array = [req.body.bg_name, req.body.bg_age, req.body.bg_time, req.body.bg_max, req.body.bg_artist, req.body.bg_year, req.body.bg_id];
		
		mysql.pool.query("UPDATE boardgames SET name=?, age_requirement=?, playing_time=?, max_players=?, artist=?, year_published=? WHERE id=?", array, function(err, result)
		{
			if (err)
			{
				next(err);
				return;
			}
			mysql.pool.query(bgSelectionQuery, function(err, rows, fields)
			{
				if(err)
				{
					next(err);
					return;
				}
				context.bg_array = rows;
				context.bg_length = rows.length;
				res.redirect('http://flip3.engr.oregonstate.edu:22725/boardgames');
			});
			
		});
	}
});


// below is a reference from CS290 code
app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://flip3.engr.oregonstate.edu:' + app.get('port') + '; press Ctrl-C to terminate.');
});