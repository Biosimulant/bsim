"""Tests for biosim.simui.build – 100% coverage."""
import subprocess
from pathlib import Path
from unittest.mock import patch, MagicMock

import pytest
from biosim.simui.build import _run, main
import biosim.simui.build as build_mod


class TestRun:
    def test_run_returns_exit_code(self, tmp_path):
        rc = _run(["echo", "hello"], cwd=tmp_path)
        assert rc == 0


class TestMain:
    def test_npm_not_found(self, monkeypatch):
        monkeypatch.setattr("shutil.which", lambda x: None)
        assert main() == 1

    def test_frontend_dir_not_found(self, tmp_path, monkeypatch):
        """When packages/simui-ui doesn't exist, should return 1."""
        monkeypatch.setattr("shutil.which", lambda x: "/usr/bin/npm")
        # Point __file__ to a location where packages/simui-ui won't exist
        fake_file = tmp_path / "src" / "biosim" / "simui" / "build.py"
        fake_file.parent.mkdir(parents=True)
        fake_file.write_text("")
        (tmp_path / "src").mkdir(exist_ok=True)
        monkeypatch.setattr(build_mod, "__file__", str(fake_file))
        assert main() == 1

    def test_src_dir_added_to_path(self, tmp_path, monkeypatch):
        """When src/ dir exists, it should be added to sys.path."""
        monkeypatch.setattr("shutil.which", lambda x: None)
        fake_file = tmp_path / "src" / "biosim" / "simui" / "build.py"
        fake_file.parent.mkdir(parents=True)
        fake_file.write_text("")
        monkeypatch.setattr(build_mod, "__file__", str(fake_file))
        import sys
        before = list(sys.path)
        main()  # Returns 1 for npm not found, but src/ should be added
        src_dir = str(tmp_path / "src")
        assert src_dir in sys.path
        # Clean up
        if src_dir in sys.path:
            sys.path.remove(src_dir)

    def test_with_build_script(self, tmp_path, monkeypatch):
        """When build script exists, should use it."""
        monkeypatch.setattr("shutil.which", lambda x: "/usr/bin/npm")
        # Set up directory structure
        fake_file = tmp_path / "src" / "biosim" / "simui" / "build.py"
        fake_file.parent.mkdir(parents=True)
        fake_file.write_text("")
        monkeypatch.setattr(build_mod, "__file__", str(fake_file))

        # Create frontend dir and build script
        (tmp_path / "packages" / "simui-ui").mkdir(parents=True)
        scripts = tmp_path / "scripts"
        scripts.mkdir()
        (scripts / "build_simui_frontend.sh").write_text("#!/bin/bash\nexit 0\n")

        with patch.object(build_mod, "_run", return_value=0) as mock_run:
            rc = main()
        assert rc == 0
        mock_run.assert_called_once()
        args = mock_run.call_args[0]
        assert "bash" in args[0][0]

    def test_inline_build_with_lockfile(self, tmp_path, monkeypatch):
        """Inline build with lockfile should use npm ci."""
        monkeypatch.setattr("shutil.which", lambda x: "/usr/bin/npm")
        fake_file = tmp_path / "src" / "biosim" / "simui" / "build.py"
        fake_file.parent.mkdir(parents=True)
        fake_file.write_text("")
        monkeypatch.setattr(build_mod, "__file__", str(fake_file))

        frontend_dir = tmp_path / "packages" / "simui-ui"
        frontend_dir.mkdir(parents=True)
        (frontend_dir / "package-lock.json").write_text("{}")

        dist_dir = frontend_dir / "dist-static"
        dist_dir.mkdir()
        (dist_dir / "app.js").write_bytes(b"// app")
        (dist_dir / "app.css").write_bytes(b"/* css */")

        with patch.object(build_mod, "_run", return_value=0) as mock_run:
            rc = main()
        assert rc == 0
        # Should have called npm ci, npm run build:static
        cmds = [call[0][0] for call in mock_run.call_args_list]
        assert any("ci" in cmd for cmd in cmds)
        assert any("build:static" in cmd for cmd in cmds)
        # Static files should be copied
        static_dir = fake_file.parent / "static"
        assert (static_dir / "app.js").exists()
        assert (static_dir / "app.css").exists()

    def test_inline_build_no_lockfile(self, tmp_path, monkeypatch):
        """Inline build without lockfile should use npm install."""
        monkeypatch.setattr("shutil.which", lambda x: "/usr/bin/npm")
        fake_file = tmp_path / "src" / "biosim" / "simui" / "build.py"
        fake_file.parent.mkdir(parents=True)
        fake_file.write_text("")
        monkeypatch.setattr(build_mod, "__file__", str(fake_file))

        frontend_dir = tmp_path / "packages" / "simui-ui"
        frontend_dir.mkdir(parents=True)
        # No lockfile

        dist_dir = frontend_dir / "dist-static"
        dist_dir.mkdir()
        (dist_dir / "app.js").write_bytes(b"// app")

        with patch.object(build_mod, "_run", return_value=0) as mock_run:
            rc = main()
        assert rc == 0
        cmds = [call[0][0] for call in mock_run.call_args_list]
        assert any("install" in cmd for cmd in cmds)

    def test_inline_build_npm_ci_fails(self, tmp_path, monkeypatch):
        """If npm ci fails, should return non-zero."""
        monkeypatch.setattr("shutil.which", lambda x: "/usr/bin/npm")
        fake_file = tmp_path / "src" / "biosim" / "simui" / "build.py"
        fake_file.parent.mkdir(parents=True)
        fake_file.write_text("")
        monkeypatch.setattr(build_mod, "__file__", str(fake_file))

        frontend_dir = tmp_path / "packages" / "simui-ui"
        frontend_dir.mkdir(parents=True)
        (frontend_dir / "package-lock.json").write_text("{}")

        with patch.object(build_mod, "_run", return_value=1):
            rc = main()
        assert rc == 1

    def test_inline_build_install_fails(self, tmp_path, monkeypatch):
        """If npm install fails, should return non-zero."""
        monkeypatch.setattr("shutil.which", lambda x: "/usr/bin/npm")
        fake_file = tmp_path / "src" / "biosim" / "simui" / "build.py"
        fake_file.parent.mkdir(parents=True)
        fake_file.write_text("")
        monkeypatch.setattr(build_mod, "__file__", str(fake_file))

        frontend_dir = tmp_path / "packages" / "simui-ui"
        frontend_dir.mkdir(parents=True)

        with patch.object(build_mod, "_run", return_value=1):
            rc = main()
        assert rc == 1

    def test_inline_build_build_fails(self, tmp_path, monkeypatch):
        """If npm run build:static fails, should return non-zero."""
        monkeypatch.setattr("shutil.which", lambda x: "/usr/bin/npm")
        fake_file = tmp_path / "src" / "biosim" / "simui" / "build.py"
        fake_file.parent.mkdir(parents=True)
        fake_file.write_text("")
        monkeypatch.setattr(build_mod, "__file__", str(fake_file))

        frontend_dir = tmp_path / "packages" / "simui-ui"
        frontend_dir.mkdir(parents=True)
        (frontend_dir / "package-lock.json").write_text("{}")

        call_count = [0]
        def fake_run(cmd, cwd):
            call_count[0] += 1
            return 0 if call_count[0] == 1 else 1  # ci succeeds, build fails

        with patch.object(build_mod, "_run", side_effect=fake_run):
            rc = main()
        assert rc == 1

    def test_inline_build_dist_missing(self, tmp_path, monkeypatch):
        """If dist artifact not found, should return 1."""
        monkeypatch.setattr("shutil.which", lambda x: "/usr/bin/npm")
        fake_file = tmp_path / "src" / "biosim" / "simui" / "build.py"
        fake_file.parent.mkdir(parents=True)
        fake_file.write_text("")
        monkeypatch.setattr(build_mod, "__file__", str(fake_file))

        frontend_dir = tmp_path / "packages" / "simui-ui"
        frontend_dir.mkdir(parents=True)
        (frontend_dir / "package-lock.json").write_text("{}")
        # No dist-static directory

        with patch.object(build_mod, "_run", return_value=0):
            rc = main()
        assert rc == 1

    def test_inline_build_no_css(self, tmp_path, monkeypatch):
        """Build should work without CSS bundle."""
        monkeypatch.setattr("shutil.which", lambda x: "/usr/bin/npm")
        fake_file = tmp_path / "src" / "biosim" / "simui" / "build.py"
        fake_file.parent.mkdir(parents=True)
        fake_file.write_text("")
        monkeypatch.setattr(build_mod, "__file__", str(fake_file))

        frontend_dir = tmp_path / "packages" / "simui-ui"
        frontend_dir.mkdir(parents=True)
        (frontend_dir / "package-lock.json").write_text("{}")

        dist_dir = frontend_dir / "dist-static"
        dist_dir.mkdir()
        (dist_dir / "app.js").write_bytes(b"// app")
        # No app.css

        with patch.object(build_mod, "_run", return_value=0):
            rc = main()
        assert rc == 0
        static_dir = fake_file.parent / "static"
        assert (static_dir / "app.js").exists()
        assert not (static_dir / "app.css").exists()
