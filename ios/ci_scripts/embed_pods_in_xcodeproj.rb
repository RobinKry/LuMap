#!/usr/bin/env ruby
# frozen_string_literal: true

# Embed Pods/Pods.xcodeproj as a subproject of LuMap.xcodeproj and add a
# target dependency LuMap → Pods-LuMap.
#
# Why: Xcode Cloud may archive with `-project LuMap.xcodeproj` (ASC misconfig).
# Without the CocoaPods workspace, Pods targets never build → missing modulemaps
# / "No such module 'Expo'". Embedding Pods makes `-project` builds pull in pods.
#
# Idempotent: safe to run after every `pod install`.
# Requires the `xcodeproj` gem (ships with CocoaPods).

require 'pathname'
require 'xcodeproj'

IOS_DIR = Pathname.new(__dir__).parent.expand_path
APP_PROJECT_PATH = IOS_DIR + 'LuMap.xcodeproj'
PODS_PROJECT_PATH = IOS_DIR + 'Pods' + 'Pods.xcodeproj'
APP_TARGET_NAME = 'LuMap'
PODS_TARGET_NAME = 'Pods-LuMap'

def die(msg)
  warn "embed_pods: error: #{msg}"
  exit 1
end

die "missing #{APP_PROJECT_PATH}" unless APP_PROJECT_PATH.directory?
die "missing #{PODS_PROJECT_PATH} — run pod install first" unless PODS_PROJECT_PATH.directory?

app_project = Xcodeproj::Project.open(APP_PROJECT_PATH.to_s)
pods_project = Xcodeproj::Project.open(PODS_PROJECT_PATH.to_s)

app_target = app_project.targets.find { |t| t.name == APP_TARGET_NAME }
die "app target #{APP_TARGET_NAME.inspect} not found" unless app_target

pods_target = pods_project.targets.find { |t| t.name == PODS_TARGET_NAME }
die "pods target #{PODS_TARGET_NAME.inspect} not found" unless pods_target

pods_path_abs = PODS_PROJECT_PATH.realpath
pods_path_rel = 'Pods/Pods.xcodeproj'

# --- Find or add Pods.xcodeproj as a subproject ---
def pods_file_ref?(ref, pods_path_abs, pods_path_rel)
  return false unless ref.is_a?(Xcodeproj::Project::Object::PBXFileReference)
  path = ref.real_path.to_s rescue nil
  return true if path && Pathname.new(path).exist? && Pathname.new(path).realpath == pods_path_abs
  name = ref.path.to_s
  name == pods_path_rel || name.end_with?('/Pods.xcodeproj') || File.basename(name) == 'Pods.xcodeproj'
end

existing_ref = app_project.files.find { |f| pods_file_ref?(f, pods_path_abs, pods_path_rel) }

if existing_ref
  unless existing_ref.project_reference_metadata
    # File ref present but projectReferences missing — recreate properly.
    warn 'embed_pods: Pods.xcodeproj file ref without projectReferences — removing and re-adding'
    existing_ref.remove_from_project
    existing_ref = nil
  else
    puts "embed_pods: Pods.xcodeproj already a subproject (#{existing_ref.uuid})"
  end
end

unless existing_ref
  # group#new_file / new_reference auto-detects .xcodeproj → new_subproject
  # (product proxies + projectReferences).
  existing_ref = app_project.main_group.new_reference(pods_path_abs.to_s)
  # Prefer a stable relative path so the pbxproj is portable.
  existing_ref.set_path(pods_path_rel)
  existing_ref.source_tree = '<group>'
  existing_ref.name = 'Pods.xcodeproj'
  puts "embed_pods: added Pods.xcodeproj subproject (#{existing_ref.uuid})"
end

# Ensure reference_for_path resolves (needed by add_dependency).
unless app_project.reference_for_path(pods_project.path)
  # Path mismatch (abs vs rel) — fix by ensuring real_path matches.
  # Force the file ref path so reference_for_path can find it.
  unless app_project.reference_for_path(PODS_PROJECT_PATH.to_s) ||
         app_project.reference_for_path(pods_path_abs.to_s)
    die 'Pods.xcodeproj subproject ref not resolvable via reference_for_path'
  end
end

# --- Target dependency LuMap → Pods-LuMap ---
dep = app_target.dependency_for_target(pods_target)
if dep
  proxy = dep.target_proxy
  if proxy && proxy.remote_global_id_string != pods_target.uuid
    puts "embed_pods: updating Pods-LuMap remote UUID #{proxy.remote_global_id_string} → #{pods_target.uuid}"
    proxy.remote_global_id_string = pods_target.uuid
    proxy.remote_info = PODS_TARGET_NAME
    proxy.container_portal = existing_ref.uuid
  else
    puts "embed_pods: dependency LuMap → Pods-LuMap already present"
  end
else
  # add_dependency needs reference_for_path(pods_project.path) to succeed.
  # Ensure pods_project.path matches what we registered.
  begin
    app_target.add_dependency(pods_target)
  rescue ArgumentError => e
    # Fallback: wire dependency manually against existing_ref.
    warn "embed_pods: add_dependency failed (#{e.message}) — wiring manually"
    container_proxy = app_project.new(Xcodeproj::Project::PBXContainerItemProxy)
    container_proxy.container_portal = existing_ref.uuid
    container_proxy.proxy_type = '1'
    container_proxy.remote_global_id_string = pods_target.uuid
    container_proxy.remote_info = PODS_TARGET_NAME

    dependency = app_project.new(Xcodeproj::Project::PBXTargetDependency)
    dependency.name = PODS_TARGET_NAME
    dependency.target_proxy = container_proxy
    app_target.dependencies << dependency
  end
  puts "embed_pods: added dependency LuMap → Pods-LuMap (#{pods_target.uuid})"
end

app_project.save
puts "embed_pods: saved #{APP_PROJECT_PATH}"
puts "embed_pods: OK — archiving -project LuMap.xcodeproj should build Pods-LuMap"
