var express =           require("express"),
    app =               express(),
    bodyParser =        require("body-parser"),
    expressSanitizer =  require("express-sanitizer"),
     passport         = require("passport"),
    methodOverride =    require("method-override"),
    mongoose =          require("mongoose"),
    User              = require("./models/user"),
    LocalStrategy     = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose");




//mongoose.connect("mongodb://localhost/restful_blog_app1");
mongoose.connect("mongodb://Vasu:warpath1@ds137812.mlab.com:37812/blogapp342");
// mongodb://Vasu:warpath1@ds137812.mlab.com:37812/blogapp342
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

app.use(require("express-session")({
    secret: "You'll never walk alone",
    resave: false,
    saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());  
passport.deserializeUser(User.deserializeUser());




var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now},
    url: String
});

var Blog = mongoose.model("Blog", blogSchema);

/*Blog.create({
    title: "Test blog",
    image: "https://cdn.blizzardwatch.com/wp-content/uploads/2018/06/BFA_trailer_Sylvanas.jpg",
    body: "Slyvana windrunner"
}); */

app.get("/",function(req, res) {
    res.redirect("/blogs");
});

// index route
app.get("/blogs",function(req, res){
     Blog.find({}, function(err, blogs){
       if(err){
           console.log("error!");
       } 
       else{
           res.render("index",{blogs: blogs}); 
       }
    });
});

// register


app.get("/register", function(req, res){
   res.render("register"); 
});
//handling user sign up
app.post("/register", function(req, res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render('register');
        }
        passport.authenticate("local")(req, res, function(){
           res.redirect("/blogs");
        });
    });
});


// login

//render login form
app.get("/login", function(req, res){
   res.render("login"); 
});
//login logic
//middleware
app.post("/login", passport.authenticate("local", {
    successRedirect: "/blogs",
    failureRedirect: "/login"
}) ,function(req, res){
});


// logout

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/login");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}
// new  route

app.get("/blogs/new",isLoggedIn, function(req, res) {
    res.render("new");
});

// create route

app.post("/blogs",isLoggedIn, function(req ,res){
   // create
   req.body.blog.body = req.sanitize(req.body.blog.body)
   Blog.create(req.body.blog, function(err, newBlog){
       if(err){
           res.render("new");
       }
       else{
           // redirect to blog page
           res.redirect("/blogs");
       }
   });
});

//show route
app.get("/blogs/:id", function(req, res){
   Blog.findById(req.params.id, function(err, foundBlog){
       if(err){
           res.redirect("/blogs");
       } else {
           res.render("show", {blog: foundBlog});
       }
   })
 //  res.render("shows");
});

// edit route

app.get("/blogs/:id/edit",isLoggedIn, function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: foundBlog});
        }
    });
    
})

// update route
app.put("/blogs/:id",isLoggedIn, function(req, res){
     req.body.blog.body = req.sanitize(req.body.blog.body)
   Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
       if(err){
           res.redirect("/blogs");
       } else {
           res.redirect("/blogs/" + req.params.id);
       }
   });
});


// destroy

app.delete("/blogs/:id",isLoggedIn, function(req ,res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    })
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server is running");
})















