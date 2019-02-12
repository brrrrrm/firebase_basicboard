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
var key = null;

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
  init(); //auth가 바뀔 때마다 init 해줌
});

//DB
function init(){
  $(".gbooks").empty();
  ref = db.ref("root/gbook");  //DB객체에서 생성된 시점의 인스턴스 
  //해당 주소? 계층에 테이블을 만든다 뭐 이런
  ref.off();
  ref.on("child_added", onAdd); //push 하면 child add
  ref.on("child_removed", onRmv);
  ref.on("child_changed", onChg); 
}

function onAdd(data){
  var k = data.key;
  var v = data.val();
  var date = timestampChg(v.wdate);
  var icon = "";
  if (user) {
    if (user.uid == v.uid){
      icon += '<i onclick="onUpdate(this);" class="fas fa-edit"></i>';
      icon += '<i onclick="onDelete(this);" class="fas fa-trash"></i>';
    } 
  }
  var html = '<ul id="'+k+'" data-uid="'+v.uid+'" class="gbook">';
  html += '<li><b>'+v.uname+ '</b>' +' ('+v.email+')  <span>&nbsp;&nbsp;' + date +'</span></li>';
  html += '<li>'+v.content+'</li>';
  html += '<li>'+icon+'</li>';
  html += '</ul>';
  $(".gbooks").prepend(html);
}

function onRmv(data){
  var k = data.key;
  $("#"+k).remove();
}

function onChg(data){
  var k = data.key;
  var v = data.val();
  $("#"+k).children("li:first-child").children("span").html(timestampChg(v.wdate));
  $("#"+k).children("li:nth-child(2)").html(v.content);
  $("#"+k).find(".fa-edit").show();
}

function zeroAdd(n){
  if(n<10) return "0" + n;
  else return n;
}

function timestampChg(timestamp){
  var d = new Date(timestamp);
  var date = d.getFullYear() + "년" + Number(d.getMonth() + 1) + "월 " + d.getDate() + "일 " + d.getHours() + ":" + d.getMinutes();
  return date;
}

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
      uname : user.displayName,
      wdate : Date.now()
    }).key;
    $content.val('');
  }
});

function onUpdate(obj){
  key = $(obj).parent().parent().attr("id");
  var $target = $(obj).parent().prev();
  var v =  $target.html();
  var html = '<input type="text" name="content" class="w3-input w3-show-inline-block" style="width:calc(100% - 150px); border : 0" value="' + v + '">&nbsp;';
  html += '<button type="button" class="w3-button w3-orange" style="margin-top:-4px;" onclick="onUpdateDone(this);">수정</button>';
  html += '<button type="button" class="w3-button w3-grey" style="margin-top:-4px;" onclick="onCancel(this, \''+v+'\');">취소</button>';
  $target.html(html);
  $(obj).hide();
  $target.children("input").focus();
}

function onCancel(obj, val){
  var $target = $(obj).parent().html(val);
  $target.parent().parent().find(".fa-edit").show();
}

function onUpdateDone(obj){
  var $input = $(obj).prev();
  key = $(obj).parent().parent().attr("id");
  var content = $input.val();
  ref = db.ref("root/gbook/"+key).update({
    content : content,
    wdate : Date.now()
  });
}

function onDelete(obj){
  key = $(obj).parent().parent().attr("id");
  if(confirm("정말 삭제하시겠습니까?")){
    db.ref("root/gbook/"+ key).remove();
  }
}