$(function() {

	var minLeft = 0;

	var sliderWidth = $('.slider').width();


	$('.layer').on('touchstart', function(e) {

		var x = e.targetTouches[0].pageX;
		var maxLeft = $(this).width();
		var offsetLeft = $(this).offset().left;
		var axis = x - offsetLeft <= 0 ? 0 : x - offsetLeft >= maxLeft ? maxLeft : x - offsetLeft;

		$('.slider').css({
			left: (axis - sliderWidth) + 'px'
		});
		$('.progress_active').css({
			width: axis
		});

		var p_a = $('.progress_active').width();
		var p = $('.progress').width();
		audio.currentTime = p_a / p * audio.duration;


		$(this).on('touchmove', function(e) {
			var x = e.targetTouches[0].pageX;
			var maxLeft = $(this).width();
			var offsetLeft = $(this).offset().left;
			var axis = x - offsetLeft <= 0 ? 0 : x - offsetLeft >= maxLeft ? maxLeft : x - offsetLeft;

			$('.slider').css({
				left: (axis - sliderWidth) + 'px'
			});
			$('.progress_active').css({
				width: axis
			});

			var p_a = $('.progress_active').width();
			var p = $('.progress').width();
			audio.currentTime = p_a / p * audio.duration;

		});

	});

	//触碰松开时
	$('.m-event-progress').on('touchend', function(e) {
		var p_a = $('.progress_active').width();
		var p = $('.progress').width();
		audio.currentTime = p_a / p * audio.duration;
	})




	var songsId = [];

	var count = 0;

	var songsList = null;
	
	//心动歌单
	var beckoningLists = {};
	
	//处理歌手名称
	function initPage(d) {
		$('.nav_content>p').eq(0).text(d.al.name);

		if (d.ar.length == 1) {
			$('.nav_content>p').eq(1).text(d.ar[0].name);
		} else {
			$('.nav_content>p').eq(1).text(d.ar[0].name + " / " + d.ar[1].name);
		}

		$('.music_img_box>img').attr('src', d.al.picUrl);
	}

	//获取歌单
	$.ajax({
		type: 'GET',
		url: 'http://www.arthurdon.top:3000/top/list?idx=1',
		success: function(data) {

			songsList = data;

			console.log('data ==> ', data);

			console.log('歌曲 ==> ', data.playlist.tracks);

			initPage(data.playlist.tracks[count]);

			//保存歌曲id
			for (let i = 0; i < data.privileges.length; i++) {
				songsId.push(data.privileges[i].id);
			}
			
			// 初始化歌曲列表
			for (let i = 0; i < data.playlist.tracks.length; i++) {
				// console.log(data.playlist.tracks);
				let $li = $(`
					<li class="song" name='0'>
						<div class="mag clear">
							<div class="singer_img fl">
								<img src="${data.playlist.tracks[i].al.picUrl}" >
							</div>
							<div class="singer_text">
								<p>${data.playlist.tracks[i].al.name}</p>
								<p>${data.playlist.tracks[i].ar.length == 1 ? data.playlist.tracks[i].ar[0].name : data.playlist.tracks[i].ar[0].name + ' / ' + data.playlist.tracks[i].ar[1].name}</p>
							</div>
							<div class="singer_time">
								<p>${dealSongTime(data.playlist.tracks[i].dt)}</p>
							</div>
						</div>
					</li>
				`); 
				
				$('.songList>ul').append($li);
			}
			
			
			$('.songList>ul>li').on('click',function(){
				$(this).addClass('active').siblings().removeClass('active');
				
				if($(this).attr('name') == 0){
					$(this).attr('name',1);
					$('.play').attr('name',1);
				}else{
					$(this).attr('name',0);
					$('.play').attr('name',0);
				}
				
				$('.play>img').attr('src', "img/播放.png");
				count = $(this).index();
				initPage(songsList.playlist.tracks[count]);
				audio.src = 'https://music.163.com/song/media/outer/url?id=' + songsId[count];
				
				$('.menu').attr('name',0);
				$('.menu_lists').hide(100);
				
			});
			
			
		}
	})


	//处理歌曲时间
	function dealSongTime(time) {
		var second = Math.floor(time / 1000 % 60);
		second = second >= 10 ? second : '0' + second;
		var minute = Math.floor(time / 1000 / 60);
		minute = minute >= 10 ? minute : '0' + minute;

		return minute + ':' + second;

	}
	
	//播放模式
	var play_mode_count = 1;
	$('.play_mode').on('click', function() {
		play_mode_count++;
		if (play_mode_count > 3) {
			play_mode_count = 1;
		}
		$(this).attr('name', play_mode_count);
		$('.play_mode>img').attr('src', 'img/' + play_mode_count + '.png');
	});


	//获取音频标签
	var audio = $('#audio')[0];

	//播放按钮
	$('.play').on('click', function() {

		if ($(this).attr('name') == 0) {
			$(this).attr('name', 1);
			$('.play>img').attr('src', "img/播放.png");
		} else {
			$(this).attr('name', 0);
			$('.play>img').attr('src', "img/暂停.png");
		}

		//通过歌曲id获取音频
		audio.src = 'https://music.163.com/song/media/outer/url?id=' + songsId[count];

	});

	//上一曲
	$('.prev').on('click', function() {
		
		$('.play').attr('name', 1);
		$('.play>img').attr('src', "img/播放.png");
		
		prev();
	});

	//下一曲
	$('.next').on('click', function() {
		
		$('.play').attr('name', 1);
		$('.play>img').attr('src', "img/播放.png");
		
		playPattern();
		
	});

	// 可播放事件
	audio.oncanplay = function() {

		if ($('.play').attr('name') == 0) {
			// console.log('拦截');
			// return;
			audio.pause();
		} else {
			this.play();
		}

		//设置歌曲当前播放时间和歌曲总时间
		$('.dtime').text(dealSongTime(this.duration * 1000));

	}

	//监听音频试试变化
	audio.ontimeupdate = function() {
		$('.ctime').text(dealSongTime(this.currentTime * 1000));

		var width = this.currentTime / this.duration * $('.progress').width() - $('.slider').width();
		
		//进度条
		$('.progress_active').css({
			width
		});
		$('.slider').css({
			left: width
		});
		
		
		$('.music_img').css({
			transform:'rotateZ('+ this.currentTime * 10 +'deg)'		//旋转
		});
		
	}
	
	//模式播放
	function playPattern(){
		var play_mode_name = $('.play_mode').attr('name');
		
		if (play_mode_name == 1) {
			count++;
			if (count > songsId.length - 1) {
				count = 0;
			}
			console.log(count);
			console.log(songsList);
			initPage(songsList.playlist.tracks[count]);
			audio.src = 'https://music.163.com/song/media/outer/url?id=' + songsId[count];
			
			$('.songList>ul>li').eq(count).addClass('active').siblings().removeClass('active');
			
			// audio.play();
		} else if(play_mode_name == 2){
			initPage(songsList.playlist.tracks[count]);
			audio.src = 'https://music.163.com/song/media/outer/url?id=' + songsId[count];
			
			$('.songList>ul>li').eq(count).addClass('active').siblings().removeClass('active');
			
			// audio.play();
		}else {
			count = parseInt(Math.random()*songsId.length);
			initPage(songsList.playlist.tracks[count]);
			audio.src = 'https://music.163.com/song/media/outer/url?id=' + songsId[count];
			
			$('.songList>ul>li').eq(count).addClass('active').siblings().removeClass('active');
			
			// audio.play();
		}
	}
	
	// 下一曲
	function prev(){
		var play_mode_name = $('.play_mode').attr('name');
		
		if (play_mode_name == 1) {
			count--;
			if (count < 0) {
				count = songsId.length - 1;
			}
			initPage(songsList.playlist.tracks[count]);
			audio.src = 'https://music.163.com/song/media/outer/url?id=' + songsId[count];
			
			$('.songList>ul>li').eq(count).addClass('active').siblings().removeClass('active');
			
			// audio.play();
		} else if(play_mode_name == 2){
			initPage(songsList.playlist.tracks[count]);
			audio.src = 'https://music.163.com/song/media/outer/url?id=' + songsId[count];
			
			$('.songList>ul>li').eq(count).addClass('active').siblings().removeClass('active');
			
			// audio.play();
		}else {
			var count = parseInt(Math.random()*songsId.length);
			initPage(songsList.playlist.tracks[count]);
			audio.src = 'https://music.163.com/song/media/outer/url?id=' + songsId[count];
			
			$('.songList>ul>li').eq(count).addClass('active').siblings().removeClass('active');
			
			// audio.play();
		}
	}

	//播放完成时
	audio.onended = function() {
		// 		$('.play').attr('name',0);
		// 		$('.play>img').attr('src',"img/暂停.png");

		playPattern();

	}
	
	// 切换歌曲列表和转盘
	$('.play_menu').on('click',function(){
		
		if($(this).attr('name') == 0){
			$(this).attr('name',1);
			$('.mid_music_img').hide(100);
			$('.songList').show(100);
		}else{
			$(this).attr('name',0);
			$('.mid_music_img').show(100);
			$('.songList').hide(100);
		}
		
	});
	
	// 显示菜单
	$('.menu').on('click',function(){
		if($(this).attr('name') == 0){
			$(this).attr('name', 1);
			$('.menu_lists').show(100);
		}
	});
	
	//隐藏菜单
	$('.mid_music_img').on('click',function(){
		$('.menu').attr('name',0);
		$('.menu_lists').hide(100);
	});
	
	//返回
	$('.previous').on('click',function(){
		
		// 隐藏菜单
		$('.menu').attr('name',0);
		$('.menu_lists').hide(100);
		
		// 切换转盘
		$('.play_menu').attr('name',0);
		$('.mid_music_img').show(100);
		$('.songList').hide(100);
	});
	
	// 心动歌曲
	$('.beckoning').on('click',function(){
		console.log(count);
		beckoningLists[count] = true;
		console.log(beckoningLists);
		
		for(let key in beckoningLists){
			console.log(key);
		}
	});
	
});
