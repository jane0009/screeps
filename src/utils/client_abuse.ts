/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { CONSTANTS } from "system";

/**
 * used for injection
 *
 * @param {string} inject_message the message to show in console
 * @param {string} text the actual script text to inject
 */
const replace_log = (inject_message: string, text: string) => {
  const inject_text = `<span style="${CONSTANTS.CLIENT_ABUSE_INJECT_MESSAGE_STYLE}">${inject_message}</span>`;
  console.log(inject_text, text.replace(/(\r\n|\n|\r)\t+|(\r\n|\n|\r) +|(\r\n|\n|\r)/gm, ""));
};

// realizing, this is actually basically useless. oh well!
/**
 * injects console summary, a script to clear and summarize the past console messages
 *
 * @param {string} keep_regex regex used to determine which messages to keep
 * @param {number} message_limit number of messages to keep
 * @deprecated broken, unnecessary
 */
const inject_console_summary = (
  keep_regex: string = CONSTANTS.CLIENT_ABUSE_DEFAULT_CONSOLE_SUMMARY_REGEX,
  message_limit: number = CONSTANTS.CLIENT_ABUSE_DEFAULT_CONSOLE_SUMMARY_MESSAGE_LIMIT
) => {
  global.client_abuse.injected ??= {};
  if (!global.client_abuse.injected.console_summary) {
    const script = `<script>
  window._console_queue=window._console_queue||[];
  window.handleConsoleQueue=function() {
    if (window._console_queue.length>0) {
      let msg=window._console_queue.shift();
      let Connection=angular.element($('body')).injector().get('Connection');
      Connection.sendConsoleCommand(\`'\${msg}'\`);
    };
  };
  window.consoleSummary=function() {
    if(window._console_summary_enable!=undefined&&window._console_summary_enable==false){
      return;
    }
    let summ_regex=new RegExp('SUMMARY','g');
    let keep_regex=new RegExp('${keep_regex}','g');
    let Connection=angular.element($('body')).injector().get('Connection');
    let Console=angular.element(document.getElementsByClassName('console-messages-list')[0]).scope().Console;
    Connection.sendConsoleCommand('\`<span style="background-color: orange; color: black;">Checking if the console needs to be cleared...</span>\`');
    let messages=Console.getMessages();
    let incomingMessages=messages.filter(function(m){return !m.out&&!m.in;});
    Connection.sendConsoleCommand(\`'icm: \${incomingMessages.length}, limit: ${message_limit}... \${incomingMessages.length>${message_limit}}, queue: \${window._console_queue.length}'\`);
    Connection.sendConsoleCommand(\`'<span style="background-color: blue; color: white;">update 5</span>'\`);
    let check=incomingMessages.length>${message_limit};
    if(check){
      let keptMessages=incomingMessages.filter(function(m){return keep_regex.test(m.text);});
      Connection.sendConsoleCommand(\`'\${incomingMessages.length}, \${keptMessages.length}'\`);
      if(keptMessages.length==0) {
        let msg=\`<span style="background-color: orange; color: black;">Console cleared, no messages kept.</span>\`;
        window._console_queue=window._console_queue.concat([msg]);
        return;
      };
      let previousSummaries=incomingMessages.filter(function(m){return summ_regex.test(m.text);}).slice(-4).map(function(m){return m.text;});
      let summary=keptMessages.map(function(m){return m.text;}).join('\\n');
      previousSummaries.push('<span style="background-color: orange; color: black;">SUMMARY:</span>\\n'+summary);
      for(let i=0;i<previousSummaries.length;i++){
        let msg=\`\${previousSummaries[i]}\`;
        window._console_queue=window._console_queue.concat([msg]);
      };
    };
  };
  window.consoleHandler=function(){
    window._console_iter=window._console_iter+1||1;
    if(window._console_iter>=10){
      window._console_iter=0;
      window.consoleSummary();
    };
    window.handleConsoleQueue();
  };
  </script>`;
    replace_log("Injecting Console Summary", script);
    global.client_abuse.injected.console_summary = true;
  }
};

/**
 * starts the timers for {@link inject_console_summary}
 *
 * @param {number} check_interval how often to run the check timer
 * @deprecated see {@link inject_console_summary}
 */
const start_console_summary_timer = (check_interval: number = CONSTANTS.CLIENT_ABUSE_DEFAULT_TIMER_CHECK_INTERVAL) => {
  const script = `<script>
  if (!window._console_summary) {
    setInterval(window.consoleHandler, ${check_interval / 10});
    window._console_summary_enable = true;
    window._console_summary = true;
  }
  </script>`;
  replace_log("Starting Console Summary Timer", script);
};

/**
 * enables the {@link inject_console_summary} script
 *
 * @deprecated see {@link inject_console_summary}
 */
const enable_console_summary = () => {
  const script = `<script>window._console_summary_enable = true;</script>`;
  replace_log("Enabling Console Summary", script);
};

/**
 * disables the {@link inject_console_summary} script
 *
 * @deprecated see {@link inject_console_summary}
 */
const disable_console_summary = () => {
  const script = `<script>window._console_summary_enable = false;</script>`;
  replace_log("Disabling Console Summary", script);
};

/**
 * injects room view notifier, a script to set a memory value of the currently viewed room; used for visuals
 *
 * @deprecated only works in browser, replaced by RoomTracker
 */
const inject_room_view_notifier = () => {
  global.client_abuse.injected ??= {};
  if (!global.client_abuse.injected.room_view_notifier) {
    const script = `<script>
    window.roomViewNotifier = function() {
      const [,page,shardName,roomName] = window.location.hash.split('/');
      if (page == "room") {
        if (window._view_notifier_shard !== shardName || window._view_notifier_room !== roomName) {
          window._view_notifier_shard = shardName;
          window._view_notifier_room = roomName;
          angular.element($('body')).injector().get('Connection').sendConsoleCommand(
            "Memory.roomViews = Memory.roomViews || []; Memory.roomViews.push({shard: '" + shardName + "',room: '" + roomName + "'});"
            );
        }
      }
    };
    </script>
    `;
    replace_log("Injecting RoomViewNotifier", script);
    global.client_abuse.injected.room_view_notifier = true;
  }
};

/**
 * starts the timers for {@link inject_room_view_notifier}
 *
 * @deprecated see {@link inject_room_view_notifier}
 */
const start_room_view_notifier_timer = () => {
  const script = `<script>
  if (!window._room_view_notifier) {
    window.addEventListener("hashchange", window.roomViewNotifier, false);
    window._room_view_notifier = true;
  }
  </script>
  `;
  replace_log("Starting RoomViewNotifier Timer", script);
};

/**
 * injects the room tracker, a replacement for {@link inject_room_view_notifier} that tracks all rooms viewed in the past {@link check_interval} ticks
 *
 * @param {number} check_interval how often to check the active room
 */
const inject_room_tracker = (check_interval: number = CONSTANTS.CLIENT_ABUSE_ROOM_TRACKER_CHECK_INTERVAL) => {
  global.client_abuse.injected ??= {};
  if (!global.client_abuse.injected.room_tracker) {
    const script = `<script>
  (function(){
    if (window._room_tracker_injected) return;
    let Api = angular.element($('section.game')).injector().get('Api');
    let Connection = angular.element($('body')).injector().get('Connection');
    let roomScope = angular.element(document.getElementsByClassName("room ng-scope")).scope();
    Connection.getMemoryByPath(null, "rooms").then(
        function(roomsObj) {
          if (!roomsObj) {
            Connection.setMemoryByPath(null, "rooms", {});
          }
        }
      );
    Connection.onRoomUpdate(roomScope, function() {
      let roomName = roomScope.Room.roomName;
      let tick = roomScope.Room.gameTime;
      if (tick % ${check_interval} !== 0) return;
      Connection.getMemoryByPath(null, "rooms." + roomName).then(
        function(baseRoomData) {
          if (!baseRoomData) {
            Connection.setMemoryByPath(null, "rooms." + roomName, {});
          }
          Connection.setMemoryByPath(
            null,
            "rooms." + roomScope.Room.roomName + ".lastViewed",
            roomScope.Room.gameTime
          );
        }
      );
    });
    window._room_tracker_injected = true;
  })()
  </script>`;
    replace_log("Injecting RoomTracker", script);
    global.client_abuse.injected.room_tracker = true;
  }
  /**
   * gets the rooms viewed in the past {@link check_interval} ticks
   *
   * @returns {string[]} list of active rooms
   */
  global.client_abuse.get_current_rooms = (): string[] => {
    Memory.rooms ??= {};
    const recent_rooms = Object.keys(Memory.rooms).filter(
      (r) => (Memory.rooms[r]?.last_viewed || 0) > Game.time - check_interval
    );
    return recent_rooms;
  };
};

global.client_abuse ??= {};
global.client_abuse.inject_console_summary = inject_console_summary;
global.client_abuse.enable_console_summary = enable_console_summary;
global.client_abuse.disable_console_summary = disable_console_summary;
global.client_abuse.inject_room_view_notifier = inject_room_view_notifier;
global.client_abuse.inject_room_tracker = inject_room_tracker;
global.client_abuse.inject_all = function () {
  if ("sim" in Game.rooms) {
    console.log("Cannot inject in sim.");
    return;
  }
  // inject_console_summary();
  // inject_room_view_notifier();
  inject_room_tracker();
};
global.client_abuse.start_all = function () {
  if ("sim" in Game.rooms) {
    console.log("Cannot start in sim.");
    return;
  }
  // start_console_summary_timer();
  // start_room_view_notifier_timer();
};

declare global {
  // eslint-disable-next-line snakecasejs/snakecasejs
  interface RoomMemory {
    last_viewed?: number;
  }

  namespace NodeJS {
    interface Global {
      client_abuse: {
        disable_console_summary?: typeof disable_console_summary;
        enable_console_summary?: typeof enable_console_summary;
        get_current_rooms?: () => string[];
        inject_all?: () => void;
        inject_console_summary?: typeof inject_console_summary;
        inject_room_tracker?: typeof inject_room_tracker;
        inject_room_view_notifier?: typeof inject_room_view_notifier;
        injected?: {
          console_summary?: boolean;
          room_tracker?: boolean;
          room_view_notifier?: boolean;
        };
        start_all?: () => void;
      };
    }
  }
}
