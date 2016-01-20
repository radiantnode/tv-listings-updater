CREATE TABLE `entries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Title` varchar(255) DEFAULT NULL,
  `EpisodeTitle` varchar(255) DEFAULT NULL,
  `Description` TEXT DEFAULT NULL,
  `AiringTime` datetime DEFAULT NULL,
  `Duration` int(11) DEFAULT NULL,
  `ChannelNumber` int(11) DEFAULT NULL,
  `ChannelCallsign` varchar(12) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_entries_on_title` (`Title`),
  KEY `index_entries_on_episode_title` (`EpisodeTitle`),
  KEY `index_entries_airing_time` (`AiringTime`),
  KEY `index_entries_channel_number` (`ChannelNumber`),
  KEY `index_entries_channel_callsign` (`ChannelCallsign`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;