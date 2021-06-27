//method:需要大写
// url:协议(http)+域名+端口号+路径
function ajax(method, url, data, cb, isAsync) {
    // get   url + '?' + data
    // post
    var xhr = null;
    if (window.XMLHttpRequest) {
      xhr = new XMLHttpRequest();
    } else {
      xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }
  
    // xhr.readyState    1 - 4  监听是否有响应
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          cb(JSON.parse(xhr.responseText));
        }
      }
    };
    method = method.toUpperCase();
    if (method == "GET") {
      xhr.open(method, url + "?" + data, isAsync);
      xhr.send();
    } else if (method == "POST") {
      xhr.open(method, url, isAsync);
      // key=value&key1=valu1
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.send(data);
    }
}

//bindEvent:绑定事件函数
function bindEvent(){
    //左侧导航切换  
    var leftMenu = document.getElementsByClassName('left-menu')[0];
    leftMenu.onclick = function(e){
        var ddNode =e.target.parentNode;
        if(ddNode.tagName === 'DD'){
            removeClass(ddNode.parentNode.children,'active')
            ddNode.className = 'active';
            // e.target.parentNode.classList.add('active');

        }
    }
    var studentAddSubmit = document.getElementById("student-add-submit");
    studentAddSubmit.onclick = function(e){
      //阻止默认刷新页面的行为
      e.preventDefault();
      //获取表单元素
      var form = document.getElementById("student-add-form");
      //获取表单元素对应的数据 
      var formData = getFormData(form);
      if(formData.status ==='success'){
        var data = formData.data;
        var dataStr = '';
        for(var prop in data){
          //data:key=value&key1=value1
          dataStr += prop + '=' + data[prop] + '&';
        }
        transferData({
          url:'/api/student/addStudent',
          method:'get',
          data:dataStr,
          success:function(res){
            alert('添加成功');
          }

        })
        
      }else{
        alert(formData.msg);
      }
      
    }
    //编辑 删除
    var tBody = document.querySelector('#student-list table tbody');
    tBody.onclick = function(e){
      if(e.target.tagName === 'BUTTON'){
        if(e.target.classList.contains('edit')){
          var modal = document.querySelector('#student-list .modal');
          modal.style.display = 'block';
      
        }else{

        }
      }
    }
}
//移除类名  nodeList:节点列表 
function removeClass(nodeList,className){
    for(var i = 0;i < nodeList.length;i++){
        nodeList[i].classList.remove(className);
    }
}

window.onload = function(){
    bindEvent();
    hashToMenu();
    //浏览器的地址栏中哈希值变化
    window.onhashchange = function(){
        hashToMenu();
    }
}

function hashToMenu(){
    if(location.hash){
        var hashName = location.hash;
        var activeMenu = document.querySelector('.left-menu dd a[href="'+ hashName + '"]');
        activeMenu.click();  
    }else{
        var activeMenu = document.querySelector('.left-menu dd a[href="#student-list"]');
        activeMenu.click(); 
    } 
}
//获取表单数据 返回对象
function getFormData(form){
  var name = form.name.value;
  var sex = form.sex.value;
  var email = form.email.value;
  var sNo = form.sNo.value;
  var birth = form.birth.value;
  var phone = form.phone.value;
  var address = form.address.value;
  var result = {
    data:{},
    status:'success',
    msg:''
  }
  //判断信息是否填写完整
  if(!name || !email || !sNo || !birth ||  !phone || !address){
    result.status ='fail';
    result.msg = '信息填写不全，请校验后提交';
    return result;
  }
  //判断邮箱的格式
  var emailReg = /^[\w\.-]+@[\w-_]+\.com$/;
  if(!emailReg.test(email)){
    result.status = 'fail';
    result.msg = '邮箱格式不正确';
    return result;
  }
  //4到16位学号
  var sNoReg = /\d{4,16}$/;
  if(!sNoReg.test(sNo)){
    result.status = 'fail';
    result.msg = '学号应为4-16位有效数字';
    return result;
  }
  //1975-2020
  if(birth < 1975 || birth > 2020){
    result.status = 'fail';
    result.msg = '出生年份不正确';
    return result;
  }
  var phoneReg = /^1[3456789]\d{9}$/;
  if(!phoneReg.test(phone)){
    result.status = 'fail';
    result.msg = '手机号码不正确';
    return result;
  }
  result.data = {
    name,
    sex,
    email,
    sNo,
    birth,
    address,
    phone
  }
  return result;
}
//封装一个调用ajax函数的方法

function transferData(options){
  ajax(options.method||'get','http://open.duyiedu.com' + options.url,options.data + 'appkey=sweet421_1615639425141',
  function(res){
    if(res.status === 'fail'){
      alert(res.msg);
    }else{
      options.success(res.data);
    }
  },true)
}

//获取表格数据
function getTableData(){
  transferData({
    method:'get',
    url:'/api/student/findAll',
    data:'',
    success:function(res){
      tableDate = res;
      renderTable(res);
    }

  }
  )
}
getTableData();
//渲染页面
function renderTable(data){
  var str = data.reduce(function(pre,ele,index){
    return pre + `<tr>
    <td>${ele.sNo}</td>
    <td>${ele.name}</td>
    <td>${ele.sex == 0 ? '男' : '女'}</td>
    <td>${ele.email}</td>
    <td>${new Date().getFullYear() - ele.birth}</td>
    <td>${ele.phone}</td>
    <td>${ele.address}</td>
    <td>
       <button class="operation edit" data-index="${index}>编辑</button> 
       <button class="operation delete" data-index="${index}>删除</button>
    </td>
</tr>`
  },"");
  var tbody = document.querySelector('#student-list table tbody');
  tbody.innerHTML = str;
}