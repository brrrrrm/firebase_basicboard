  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyBlK452X0PofY4xYvPD8dc_ANTb32gExgE",
    authDomain: "boramboard.firebaseapp.com",
    databaseURL: "https://boramboard.firebaseio.com",
    projectId: "boramboard",
    storageBucket: "boramboard.appspot.com",
    messagingSenderId: "263847278687"
  };
  firebase.initializeApp(config);


// 전역변수 설정
var log = console.log;
var auth = firebase.auth(); //인증설정
var db = firebase.database(); //디비연동설정
var googleAuth = new firebase.auth.GoogleAuthProvider(); //구글인증
var ref = null;
var user = null;

//Auth

$("#login_bt").on("click", function(){
  auth.signInWithPopup(googleAuth);
  // auth.signInWithRedirect(googleAuth)
});

$("#logout_bt").on("click", function(){
  auth.signOut();
});

auth.onAuthStateChanged(function(result){
  if(result) {
    user = result; 
    var email = '<img src="' + 
    result.photoURL + 
    '"style="width:30px; border-radius:50px; margin-right : 1rem;">' + result.email ;
    $("#login_bt").hide();
    $("#logout_bt").show();
    $("#user_email").html(email);
  }
  else{
    user = null;
    $("#login_bt").show();
    $("#logout_bt").hide();
    $("#user_email").html('');
  }
});

//DB

init();
function init(){
  ref = db.ref("root/gbook");  //DB객체에서 생성된 시점의 인스턴스 
  //해당 주소? 계층에 테이블을 만든다 뭐 이런
  ref.on("child_added", onAdded); //push 하면 child add
}

function onAdded(data){
  log(data);
};

ref = db.ref("root/gbook"); //위와 변수는 다르지만 다른 인스턴스

$("#save_bt").click(function(){
  var $content = $("#content");
  if ($content.val() == "") {
    alert("내용을 입력하세요.");
    $content.focus();
  } else {
    ref = db.ref("root/gbook/");
    ref.push({
      email : user.email,
      uid : user.uid,
      content : $content.val(),
      wdate : Date.now(),
      uname : user.displayName
    }).key;
  }
});

