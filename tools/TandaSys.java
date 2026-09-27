package ph.tanda.app;

import android.content.Context;
import android.content.Intent;
import android.media.AudioManager;
import android.net.Uri;
import android.provider.Settings;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * The parts of the phone that a web page cannot reach.
 *
 * Opening another app, opening a settings screen, and changing the volume
 * all need Android APIs that no amount of JavaScript can call. This plugin
 * exposes just those, and nothing more.
 *
 * It is written into the project by the build workflow rather than kept in
 * the repository, because the android/ folder is generated fresh on every
 * run and anything committed there would be thrown away.
 */
@CapacitorPlugin(name = "TandaSys")
public class TandaSys extends Plugin {

    /** Launches an installed app by package name. Far more dependable than a
     *  URL scheme: schemes differ between app versions and many apps have
     *  none at all, while every app has a package name. */
    @PluginMethod
    public void openApp(PluginCall call) {
        String pkg = call.getString("package");
        if (pkg == null) { call.reject("no package"); return; }
        try {
            Intent i = getContext().getPackageManager().getLaunchIntentForPackage(pkg);
            if (i == null) { call.reject("not installed"); return; }
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(i);
            call.resolve();
        } catch (Exception e) {
            call.reject("failed: " + e.getMessage());
        }
    }

    /** True when the app is on the phone. Used to tell someone their app is
     *  missing instead of leaving them with a screen that did nothing. */
    @PluginMethod
    public void isInstalled(PluginCall call) {
        String pkg = call.getString("package");
        JSObject ret = new JSObject();
        boolean found = false;
        try {
            found = getContext().getPackageManager().getLaunchIntentForPackage(pkg) != null;
        } catch (Exception ignored) {}
        ret.put("value", found);
        call.resolve(ret);
    }

    /** Opens one of Android's own settings screens. These are actions, not
     *  addresses, which is why a link can never reach them. */
    @PluginMethod
    public void openSettings(PluginCall call) {
        String which = call.getString("which", "main");
        String action;
        switch (which) {
            case "wifi":       action = Settings.ACTION_WIFI_SETTINGS; break;
            case "bluetooth":  action = Settings.ACTION_BLUETOOTH_SETTINGS; break;
            case "display":    action = Settings.ACTION_DISPLAY_SETTINGS; break;
            case "sound":      action = Settings.ACTION_SOUND_SETTINGS; break;
            case "data":       action = Settings.ACTION_DATA_ROAMING_SETTINGS; break;
            case "apps":       action = Settings.ACTION_APPLICATION_SETTINGS; break;
            case "battery":    action = Settings.ACTION_BATTERY_SAVER_SETTINGS; break;
            case "accessibility": action = Settings.ACTION_ACCESSIBILITY_SETTINGS; break;
            default:           action = Settings.ACTION_SETTINGS;
        }
        try {
            Intent i = new Intent(action);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(i);
            call.resolve();
        } catch (Exception e) {
            call.reject("failed: " + e.getMessage());
        }
    }

    /** Media volume, 0 to 100. No permission is needed for this stream, so
     *  it works the moment the app is installed. */
    @PluginMethod
    public void setVolume(PluginCall call) {
        Integer pct = call.getInt("percent");
        if (pct == null) { call.reject("no percent"); return; }
        if (pct < 0) pct = 0;
        if (pct > 100) pct = 100;
        try {
            AudioManager am = (AudioManager) getContext().getSystemService(Context.AUDIO_SERVICE);
            int max = am.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
            int want = Math.round(max * (pct / 100f));
            am.setStreamVolume(AudioManager.STREAM_MUSIC, want, AudioManager.FLAG_SHOW_UI);
            call.resolve();
        } catch (Exception e) {
            call.reject("failed: " + e.getMessage());
        }
    }

    /** Nudges the volume up or down by one step. Closer to what someone means
     *  when they say "louder" than any absolute number would be. */
    @PluginMethod
    public void bumpVolume(PluginCall call) {
        int dir = call.getInt("direction", 1);
        try {
            AudioManager am = (AudioManager) getContext().getSystemService(Context.AUDIO_SERVICE);
            am.adjustStreamVolume(AudioManager.STREAM_MUSIC,
                    dir >= 0 ? AudioManager.ADJUST_RAISE : AudioManager.ADJUST_LOWER,
                    AudioManager.FLAG_SHOW_UI);
            call.resolve();
        } catch (Exception e) {
            call.reject("failed: " + e.getMessage());
        }
    }

    /** Screen brightness, 0 to 100.
     *
     *  Changing it for the whole phone needs a permission that the user has
     *  to grant on a system screen, and cannot be granted silently. When it
     *  has not been granted this brightens only this app's own window, which
     *  is still what an older user sees while reading a guide, and reports
     *  back so the caller can offer to open the permission screen. */
    @PluginMethod
    public void setBrightness(PluginCall call) {
        Integer pct = call.getInt("percent");
        if (pct == null) { call.reject("no percent"); return; }
        if (pct < 5) pct = 5;
        if (pct > 100) pct = 100;
        final float frac = pct / 100f;
        JSObject ret = new JSObject();

        boolean systemWide = false;
        try {
            if (Settings.System.canWrite(getContext())) {
                Settings.System.putInt(getContext().getContentResolver(),
                        Settings.System.SCREEN_BRIGHTNESS_MODE,
                        Settings.System.SCREEN_BRIGHTNESS_MODE_MANUAL);
                Settings.System.putInt(getContext().getContentResolver(),
                        Settings.System.SCREEN_BRIGHTNESS, Math.round(255 * frac));
                systemWide = true;
            }
        } catch (Exception ignored) {}

        final boolean done = systemWide;
        try {
            getActivity().runOnUiThread(new Runnable() {
                public void run() {
                    android.view.WindowManager.LayoutParams lp = getActivity().getWindow().getAttributes();
                    lp.screenBrightness = frac;
                    getActivity().getWindow().setAttributes(lp);
                }
            });
        } catch (Exception ignored) {}

        ret.put("systemWide", done);
        call.resolve(ret);
    }

    /** Opens the screen where the user can allow system-wide brightness. */
    @PluginMethod
    public void requestWriteSettings(PluginCall call) {
        try {
            Intent i = new Intent(Settings.ACTION_MANAGE_WRITE_SETTINGS,
                    Uri.parse("package:" + getContext().getPackageName()));
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(i);
            call.resolve();
        } catch (Exception e) {
            call.reject("failed: " + e.getMessage());
        }
    }
}
