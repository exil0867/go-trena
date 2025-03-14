{ pkgs, lib, config, ... }: {
  # https://devenv.sh/packages/
  packages = [ pkgs.jq pkgs.supabase-cli pkgs.air pkgs.watchman pkgs.nodePackages.expo-cli ];

  android = {
    enable = true;
    platforms.version = ["34" "35"];
    reactNative.enable = true;
    buildTools.version = ["34.0.0" "35.0.0"];
  };

  # https://devenv.sh/languages/
  languages = {
    go.enable = true;
    javascript.pnpm.enable = true;
    javascript.enable = true;
  };

  enterShell = ''
    supabase --version
  '';

  # See full reference at https://devenv.sh/reference/options/
}
