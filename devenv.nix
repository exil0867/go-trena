{ pkgs, lib, config, ... }: {
  # https://devenv.sh/packages/
  packages = [ pkgs.jq pkgs.supabase-cli pkgs.flutterPackages-source.stable pkgs.air ];

  android = {
    enable = true;
    flutter.enable = true;
  };

  # https://devenv.sh/languages/
  languages = {
    go.enable = true;
    dart.enable = true;
  };

  enterShell = ''
    supabase --version
  '';

  # See full reference at https://devenv.sh/reference/options/
}
