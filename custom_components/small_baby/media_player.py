"""Provide functionality to interact with vlc devices on the network."""
import logging
import json
import requests
import time 

import voluptuous as vol

from homeassistant.components.media_player import (
    MediaPlayerDevice, PLATFORM_SCHEMA)
from homeassistant.components.media_player.const import (
    MEDIA_TYPE_MUSIC,MEDIA_TYPE_URL, SUPPORT_PAUSE, SUPPORT_PLAY, SUPPORT_NEXT_TRACK, SUPPORT_PREVIOUS_TRACK, SUPPORT_TURN_ON, SUPPORT_TURN_OFF,
    SUPPORT_PLAY_MEDIA, SUPPORT_STOP, SUPPORT_VOLUME_MUTE, SUPPORT_VOLUME_SET, SUPPORT_SELECT_SOURCE, SUPPORT_CLEAR_PLAYLIST, SUPPORT_STOP, SUPPORT_SELECT_SOUND_MODE)
from homeassistant.const import (
    CONF_NAME, STATE_IDLE, STATE_PAUSED, STATE_PLAYING)
import homeassistant.helpers.config_validation as cv
import homeassistant.util.dt as dt_util

_LOGGER = logging.getLogger(__name__)

DEFAULT_NAME = ''

SUPPORT_VLC = SUPPORT_PAUSE | SUPPORT_VOLUME_SET | SUPPORT_VOLUME_MUTE | SUPPORT_STOP | SUPPORT_SELECT_SOUND_MODE | SUPPORT_TURN_ON | SUPPORT_TURN_OFF | \
    SUPPORT_PLAY_MEDIA | SUPPORT_PLAY | SUPPORT_STOP | SUPPORT_NEXT_TRACK | SUPPORT_PREVIOUS_TRACK | SUPPORT_SELECT_SOURCE | SUPPORT_CLEAR_PLAYLIST

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend({
    vol.Optional(CONF_NAME): cv.string,
})

def setup_platform(hass, config, add_entities, discovery_info=None):
    """Set up the vlc platform."""
    add_entities([VlcDevice(config.get(CONF_NAME, DEFAULT_NAME), hass)])


class VlcDevice(MediaPlayerDevice):
    """Representation of a vlc player."""

    def __init__(self, name, hass):
        """Initialize the vlc device."""
        self._hass = hass
        self.music_playlist = None
        self.music_index = 0
        self._name = '云音乐' + name
        self._media_title = None
        self._volume = None
        self._muted = None
        self._state = STATE_IDLE
        self._source_list = None
        self._source = None
        self._sound_mode_list = None
        self._sound_mode = None
        self._media_playlist = None
        self._media_position_updated_at = None
        self._media_position = None
        self._media_duration = None
        # 错误计数
        self.error_count = 0
        
        self._media = None

    def update(self):
        """Get the latest details from the device."""
        if self._sound_mode == None:
            # 过滤云音乐
            entity_list = self._hass.states.entity_ids('media_player')
            filter_list = filter(lambda x: x.count('media_player.yun_yin_le') == 0, entity_list)
            self._sound_mode_list = list(filter_list)
            if len(self._sound_mode_list) > 0:
                self._sound_mode = self._sound_mode_list[0]
            # _LOGGER.info(self._sound_mode_list)
            return False
        
        self._media = self._hass.states.get(self._sound_mode)
        _LOGGER.info('源播放器状态 %s，云音乐状态：%s', self._media.state, self._state)
        
        # 如果当前是播放状态，并且【源播放器的播放位置】等于 结束值，说明需要一曲
        if self._state == STATE_PLAYING and  self.media_duration - 1 <= self._media.attributes['media_position']:
            _LOGGER.info('播放器更新 下一曲')
            self.media_next_track()
        
        self._state = self._media.state
        return True

    @property
    def name(self):
        """Return the name of the device."""
        return self._name
        
    @property
    def source_list(self):
        """Return the name of the device."""
        return self._source_list   

    @property
    def source(self):
        """Return the name of the device."""
        return self._source       
        
    @property
    def sound_mode_list(self):
        """Return the name of the device."""
        return self._sound_mode_list

    @property
    def sound_mode(self):
        """Return the name of the device."""
        return self._sound_mode
        
    @property
    def media_playlist(self):
        """Return the name of the device."""
        return self._media_playlist
    
    @property
    def media_title(self):
        """Return the name of the device."""
        return self._media_title

    @property
    def state(self):
        """Return the state of the device."""
        return self._state

    @property
    def volume_level(self):
        """Volume level of the media player (0..1)."""
        if self._media == None:
            return None
        
        return self._media.attributes['volume_level']

    @property
    def is_volume_muted(self):
        """Boolean if volume is currently muted."""
        if self._media == None:
            return None
        
        return self._media.attributes['is_volume_muted']

    @property
    def supported_features(self):
        """Flag media player features that are supported."""
        return SUPPORT_VLC

    @property
    def media_content_type(self):
        """Content type of current playing media."""
        return MEDIA_TYPE_MUSIC

    @property
    def media_duration(self):
        """Duration of current playing media in seconds."""
        if self._media == None:
            return None
        
        return self._media.attributes['media_duration']

    @property
    def media_position(self):
        """Position of current playing media in seconds."""
        if self._media == None:
            return None
        
        return self._media.attributes['media_position']
		
    @property
    def media_position_updated_at(self):
        """When was the position of the current playing media valid."""
        if self._media == None:
            return None
        
        return self._media.attributes['media_position_updated_at']

    def media_seek(self, position):
        """Seek the media to a specific location."""
        #track_length = self._vlc.get_length()/1000
        #self._vlc.set_position(position/track_length)
        return None

    def mute_volume(self, mute):
        """Mute the volume."""
        #self._vlc.audio_set_mute(mute)
        self._muted = mute

    def set_volume_level(self, volume):
        """Set volume level, range 0..1."""
        #self._vlc.audio_set_volume(int(volume * 100))
        _LOGGER.info('设置音量：%s', volume)
        self.call('volume_set', {"volume": volume})
        #self._volume = volume

    def media_play(self):
        """Send play command."""
        #self._vlc.play()
        self.call('media_play')
        self._state = STATE_PLAYING

    def media_pause(self):
        """Send pause command."""
        #self._vlc.pause()
        self.call('media_pause')
        self._state = STATE_PAUSED

    def media_stop(self):
        """Send stop command."""
        #self._vlc.stop()
        self.call('media_stop')
        self._state = STATE_IDLE
		
    def play_media(self, media_type, media_id, **kwargs):
        """Play media from a URL or file."""        
        _LOGGER.info('类型：%s', media_type)        
        
        if media_type == MEDIA_TYPE_MUSIC:
            url = media_id
        elif media_type == 'music_load':
            self.music_index = int(media_id)
            music_info = self.music_playlist[self.music_index]
            url = self.get_url(music_info)
        elif media_type == MEDIA_TYPE_URL:
            _LOGGER.info('加载播放列表链接：%s', media_id)
            res = requests.get(media_id)
            play_list = res.json()
            self._media_playlist = play_list
            self.music_playlist = play_list
            music_info = self.music_playlist[0]
            url = self.get_url(music_info)
            #数据源
            source_list = []
            for index in range(len(self.music_playlist)):
                music_info = self.music_playlist[index]
                source_list.append(str(index + 1) + '.' + music_info['song'] + ' - ' + music_info['singer'])
            self._source_list = source_list
            #初始化源播放器
            self.media_stop()
            _LOGGER.info('绑定数据源：%s', self._source_list)
        elif media_type == 'music_playlist':
            _LOGGER.info('初始化播放列表')
            dict = json.loads(media_id)
            self._media_playlist = dict['list']
            self.music_playlist = json.loads(self._media_playlist)
            self.music_index = dict['index']
            music_info = self.music_playlist[self.music_index]
            url = self.get_url(music_info)
            #数据源
            source_list = []
            for index in range(len(self.music_playlist)):
                music_info = self.music_playlist[index]
                source_list.append(str(index + 1) + '.' + music_info['song'] + ' - ' + music_info['singer'])
            self._source_list = source_list
            #初始化源播放器
            self.media_stop()
        else:
            _LOGGER.error(
                "不受支持的媒体类型 %s",media_type)
            return
        _LOGGER.info('title：%s ，play url：%s' , self._media_title, url)
        # 如果没有url则下一曲（如果超过3个错误，则停止）
        if url == None:
           self.error_count = self.error_count + 1
           if self.error_count < 3:
             self.media_next_track()
           return
        
        self.error_count = 0
        #播放音乐
        self.call('play_media', {"url": url,"type": "music"})

    def media_next_track(self):
        self.music_index = self.music_index + 1
        _LOGGER.info('下一曲：%s', self.music_index)
        self.music_load()

    def media_previous_track(self):
        self.music_index = self.music_index - 1
        _LOGGER.info('上一曲：%s', self.music_index)
        self.music_load()
    
    def select_source(self, source):
        _LOGGER.info('选择源：%s', source)
        #选择播放
        self._state = STATE_IDLE
        self.music_index = self._source_list.index(source)
        self.play_media('music_load', self.music_index)
        
    def select_sound_mode(self, sound_mode):        
        self._sound_mode = sound_mode
        self._state = STATE_IDLE
        _LOGGER.info('选择声音模式：%s', sound_mode)
    
    def clear_playlist(self):
        _LOGGER.info('清除播放列表')
        self.music_playlist = None
        self.music_index = 0
        self._media_title = None
        self._source_list = None
        self._source = None
        self._media_playlist = None
        self._media_position_updated_at = None
        self._media_position = None
        self._media_duration = None                
        self.media_stop()
                
    def turn_off(self):
        """Send stop command."""
        self.clear_playlist()
    
    ## 自定义方法
    def get_url(self, music_info):
        self._media_title = music_info['song'] + ' - ' + music_info['singer']
        self._source = str(self.music_index + 1) + '.' + self._media_title
        if 'clv_url' in music_info:
           return music_info['clv_url']
        else:
           res = requests.get("https://api.jiluxinqing.com/api/music/song/url?id=" + str(music_info['id']))
           obj = res.json()
           url = obj['data'][0]['url']
           return url
    
    def call(self, action, info = None):
        dict = {"entity_id": self._sound_mode}
        if info != None:
           if 'url' in info:
              dict['media_content_id'] = info['url']
           if 'type' in info:
              dict['media_content_type'] = info['type']
           if 'volume' in info:
              dict['volume_level'] = info['volume']
        
        #调用服务
        _LOGGER.info('调用服务：%s', action)
        _LOGGER.info(dict)
        self._hass.services.call('media_player', action, dict)
        #更新源播放器
        self._hass.services.call('homeassistant', 'update_entity', {"entity_id": self._sound_mode})
            
    def music_load(self):
        if self.music_playlist == None:
           _LOGGER.info('结束播放，没有播放列表')
           return
        playlist_count = len(self.music_playlist)
        if self.music_index >= playlist_count:
           self.music_index = 0
        elif self.music_index < 0:
           self.music_index = playlist_count - 1
        self.play_media('music_load', self.music_index)