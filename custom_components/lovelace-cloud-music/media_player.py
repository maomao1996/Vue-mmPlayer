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

CONF_ARGUMENTS = 'arguments'
DEFAULT_NAME = 'lovelace-cloud-music'

SUPPORT_VLC = SUPPORT_PAUSE | SUPPORT_VOLUME_SET | SUPPORT_VOLUME_MUTE | SUPPORT_STOP | SUPPORT_SELECT_SOUND_MODE | SUPPORT_TURN_ON | SUPPORT_TURN_OFF | \
    SUPPORT_PLAY_MEDIA | SUPPORT_PLAY | SUPPORT_STOP | SUPPORT_NEXT_TRACK | SUPPORT_PREVIOUS_TRACK | SUPPORT_SELECT_SOURCE | SUPPORT_CLEAR_PLAYLIST

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend({
    vol.Optional(CONF_ARGUMENTS, default=''): cv.string,
    vol.Optional(CONF_NAME): cv.string,
})

def setup_platform(hass, config, add_entities, discovery_info=None):
    """Set up the vlc platform."""
    add_entities([VlcDevice(config.get(CONF_NAME, DEFAULT_NAME),
                            config.get(CONF_ARGUMENTS), hass)])


class VlcDevice(MediaPlayerDevice):
    """Representation of a vlc player."""

    def __init__(self, name, arguments, hass):
        """Initialize the vlc device."""
        self._hass = hass
        self.music_playlist = None
        self.music_index = 0
        import vlc
        self._instance = vlc.Instance(arguments)
        self._vlc = self._instance.media_player_new()
        event_manager = self._vlc.event_manager()
        event_manager.event_attach(vlc.EventType.MediaPlayerEndReached, self.end_callback)
        self._name = name
        self._media_title = None
        self._volume = None
        self._muted = None
        self._state = None
        self._source_list = None
        self._source = None
        self._sound_mode_list = ['测试一','测试一','测试一']
        self._sound_mode = None
        self._media_playlist = None
        self._media_position_updated_at = None
        self._media_position = None
        self._media_duration = None

    def update(self):
        """Get the latest details from the device."""
        import vlc
        status = self._vlc.get_state()
        if status == vlc.State.Playing:
            self._state = STATE_PLAYING
        elif status == vlc.State.Paused:
            self._state = STATE_PAUSED
        else:
            self._state = STATE_IDLE
        self._media_duration = self._vlc.get_length()/1000
        position = self._vlc.get_position() * self._media_duration
        if position != self._media_position:
            self._media_position_updated_at = dt_util.utcnow()
            self._media_position = position

        self._volume = self._vlc.audio_get_volume() / 100
        self._muted = (self._vlc.audio_get_mute() == 1)

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
        return self._volume

    @property
    def is_volume_muted(self):
        """Boolean if volume is currently muted."""
        return self._muted

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
        return self._media_duration

    @property
    def media_position(self):
        """Position of current playing media in seconds."""
        return self._media_position
		
    @property
    def media_position_updated_at(self):
        """When was the position of the current playing media valid."""
        return self._media_position_updated_at

    def media_seek(self, position):
        """Seek the media to a specific location."""
        track_length = self._vlc.get_length()/1000
        self._vlc.set_position(position/track_length)

    def mute_volume(self, mute):
        """Mute the volume."""
        self._vlc.audio_set_mute(mute)
        self._muted = mute

    def set_volume_level(self, volume):
        """Set volume level, range 0..1."""
        self._vlc.audio_set_volume(int(volume * 100))
        self._volume = volume

    def media_play(self):
        """Send play command."""
        self._vlc.play()
        self._state = STATE_PLAYING

    def media_pause(self):
        """Send pause command."""
        self._vlc.pause()
        self._state = STATE_PAUSED

    def media_stop(self):
        """Send stop command."""
        self._vlc.stop()
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
            list = res.json()
            self._media_playlist = list
            self.music_playlist = list
            music_info = self.music_playlist[0]
            url = self.get_url(music_info)
            #数据源
            source_list = []
            for index in range(len(self.music_playlist)):
                music_info = self.music_playlist[index]
                source_list.append(str(index + 1) + '.' + music_info['song'] + ' - ' + music_info['singer'])
            self._source_list = source_list
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
        else:
            _LOGGER.error(
                "不受支持的媒体类型 %s",media_type)
            return
        _LOGGER.info('title：%s ，play url：%s' , self._media_title, url)
        # 如果没有url则下一曲
        if url == None:
           self.media_next_track()
           return
        self._vlc.set_media(self._instance.media_new(url))
        self._vlc.play()
        self._state = STATE_PLAYING

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
        self.music_index = self._source_list.index(source)
        self.play_media('music_load', self.music_index)
        
    def select_sound_mode(self, sound_mode):
        _LOGGER.info('选择声音模式：%s', sound_mode)
    
    def clear_playlist(self):
        _LOGGER.info('清除播放列表')
        self.music_playlist = None
        self.music_index = 0
        self._media_title = None
        self._source_list = None
        self._source = None
        self._sound_mode_list = None
        self._sound_mode = None
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
    
    def call(self, action, info):
        dict = {"entity_id": "media_player.clv"}
        if info != None:
           if info['id'] != None:
              dict['media_content_id'] = info['id']
           if info['type'] != None:
              dict['media_content_type'] = info['type']
        #调用服务
        result = self._hass.services.call('media_player', action, dict)
        _LOGGER.info('调用服务%s', result)
    
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
    
    def end_callback(self, event):
        _LOGGER.info('结束播放')
        self.call('media_next_track', None)