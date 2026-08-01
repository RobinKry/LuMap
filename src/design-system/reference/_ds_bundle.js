/* @ds-bundle: {"format":4,"namespace":"LuMapDesignSystem_437202","components":[{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"SectionLabel","sourcePath":"components/core/SectionLabel.jsx"},{"name":"StatBlock","sourcePath":"components/core/StatBlock.jsx"},{"name":"TextField","sourcePath":"components/core/TextField.jsx"},{"name":"EventCard","sourcePath":"components/events/EventCard.jsx"},{"name":"FriendAvatarStack","sourcePath":"components/events/FriendAvatarStack.jsx"},{"name":"LinkedInMentionCard","sourcePath":"components/events/LinkedInMentionCard.jsx"},{"name":"PlatformBadge","sourcePath":"components/events/PlatformBadge.jsx"},{"name":"MapPin","sourcePath":"components/map/MapPin.jsx"},{"name":"ModeSwitch","sourcePath":"components/navigation/ModeSwitch.jsx"},{"name":"BottomSheet","sourcePath":"components/surfaces/BottomSheet.jsx"}],"sourceHashes":{"components/core/Button.jsx":"4c5598dd9939","components/core/SectionLabel.jsx":"cb44ea25b565","components/core/StatBlock.jsx":"0c88fb240f15","components/core/TextField.jsx":"fa7ed71f5f9e","components/events/EventCard.jsx":"d885246748e5","components/events/FriendAvatarStack.jsx":"2ef29aa68e0e","components/events/LinkedInMentionCard.jsx":"7fcc4c732fc1","components/events/PlatformBadge.jsx":"1d7f4240595a","components/map/MapPin.jsx":"429ffe435825","components/navigation/ModeSwitch.jsx":"0d860e4694ba","components/surfaces/BottomSheet.jsx":"434ca269f1ed","ui_kits/lumap-app/App.jsx":"baf8ba432f84","ui_kits/lumap-app/MapCanvas.jsx":"e98f7a583bf1","ui_kits/lumap-app/MapHome.jsx":"3f2108598893","ui_kits/lumap-app/SettingsScreen.jsx":"3ff4c7598c40","ui_kits/lumap-app/feedEvents.jsx":"083fae1f4d16"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.LuMapDesignSystem_437202 = window.LuMapDesignSystem_437202 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const base = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  fontFamily: 'var(--font-ui)',
  fontWeight: 'var(--weight-bold)',
  border: 'none',
  cursor: 'pointer',
  borderRadius: 'var(--radius-full)',
  transition: 'transform var(--dur-fast) var(--ease-bounce), opacity var(--dur-fast) var(--ease-standard), background var(--dur-base) var(--ease-standard)',
  textAlign: 'center',
  textDecoration: 'none',
  whiteSpace: 'nowrap'
};
const variants = {
  primary: {
    background: 'var(--accent)',
    color: 'var(--accent-ink)',
    boxShadow: 'var(--shadow-card)'
  },
  soft: {
    background: 'var(--accent-soft)',
    color: 'var(--accent-ink)'
  },
  ghost: {
    background: 'var(--surface-card)',
    color: 'var(--text-primary)',
    border: 'var(--stroke) solid var(--border-strong)',
    fontWeight: 'var(--weight-semibold)'
  },
  chrome: {
    background: 'var(--surface-chrome)',
    color: 'var(--text-primary)',
    border: 'var(--stroke) solid var(--border-soft)',
    fontWeight: 'var(--weight-semibold)',
    backdropFilter: 'var(--blur-backdrop)',
    boxShadow: 'var(--shadow-card)'
  },
  linkedin: {
    background: 'var(--lm-linkedin)',
    color: 'var(--lm-paper-white)'
  }
};
const sizes = {
  sm: {
    fontSize: 'var(--text-xs)',
    padding: '9px 14px'
  },
  md: {
    fontSize: 'var(--text-sm)',
    padding: '13px 18px'
  }
};
function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  disabled = false,
  style,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    disabled: disabled,
    style: {
      ...base,
      ...sizes[size],
      ...variants[variant],
      width: block ? '100%' : undefined,
      opacity: disabled ? 0.4 : 1,
      pointerEvents: disabled ? 'none' : undefined,
      ...style
    },
    onPointerDown: e => {
      e.currentTarget.style.transform = 'scale(var(--press-scale))';
    },
    onPointerUp: e => {
      e.currentTarget.style.transform = 'scale(1)';
    },
    onPointerLeave: e => {
      e.currentTarget.style.transform = 'scale(1)';
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/SectionLabel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function SectionLabel({
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      fontFamily: 'var(--font-ui)',
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-bold)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wide)',
      color: 'var(--text-tertiary)',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { SectionLabel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SectionLabel.jsx", error: String((e && e.message) || e) }); }

// components/core/StatBlock.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function StatBlock({
  value,
  label,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      fontFamily: 'var(--font-ui)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-lg)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--text-primary)',
      lineHeight: 'var(--leading-tight)',
      letterSpacing: 'var(--tracking-display)'
    }
  }, value ?? '—'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-micro)',
      color: 'var(--text-muted)',
      marginTop: 2
    }
  }, label));
}
Object.assign(__ds_scope, { StatBlock });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatBlock.jsx", error: String((e && e.message) || e) }); }

// components/core/TextField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function TextField({
  value,
  onChange,
  placeholder,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("input", _extends({
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    autoCapitalize: "off",
    autoCorrect: "off",
    style: {
      width: '100%',
      boxSizing: 'border-box',
      background: 'var(--surface-input)',
      border: 'var(--stroke) solid var(--border-strong)',
      borderRadius: 'var(--radius-lg)',
      padding: '13px 16px',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-ui)',
      fontSize: 'var(--text-sm)',
      outline: 'none',
      boxShadow: 'var(--shadow-card)',
      transition: 'border-color var(--dur-base) var(--ease-standard), box-shadow var(--dur-base) var(--ease-standard)',
      ...style
    },
    onFocus: e => {
      e.currentTarget.style.borderColor = 'var(--accent)';
      e.currentTarget.style.boxShadow = '0 0 0 4px var(--accent-glow)';
    },
    onBlur: e => {
      e.currentTarget.style.borderColor = 'var(--border-strong)';
      e.currentTarget.style.boxShadow = 'var(--shadow-card)';
    }
  }, rest));
}
Object.assign(__ds_scope, { TextField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/TextField.jsx", error: String((e && e.message) || e) }); }

// components/events/FriendAvatarStack.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TINTS = ['var(--lm-lilac-300)', 'var(--lm-mint-300)', 'var(--lm-butter-300)', 'var(--lm-peach-300)'];
function FriendAvatarStack({
  friends = [],
  extraCount = 0,
  style,
  ...rest
}) {
  if (friends.length === 0 && extraCount === 0) return null;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      alignItems: 'center',
      ...style
    }
  }, rest), friends.slice(0, 4).map((friend, i) => /*#__PURE__*/React.createElement("div", {
    key: friend.id,
    style: {
      width: 32,
      height: 32,
      borderRadius: 'var(--radius-full)',
      overflow: 'hidden',
      border: 'var(--stroke-ring) solid var(--surface-card)',
      background: TINTS[i % TINTS.length],
      marginLeft: i === 0 ? 0 : 'var(--avatar-overlap)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto'
    }
  }, friend.avatar_url ? /*#__PURE__*/React.createElement("img", {
    src: friend.avatar_url,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--lm-ink-900)'
    }
  }, (friend.display_name || '?').slice(0, 1).toUpperCase()))), extraCount > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 8,
      fontFamily: 'var(--font-ui)',
      fontSize: 'var(--text-xs)',
      color: 'var(--text-tertiary)'
    }
  }, "+", extraCount, " others"));
}
Object.assign(__ds_scope, { FriendAvatarStack });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/events/FriendAvatarStack.jsx", error: String((e && e.message) || e) }); }

// components/events/LinkedInMentionCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function LinkedInMentionCard({
  authorName = 'Unknown',
  authorHeadline = 'LinkedIn',
  onOpen,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      marginTop: 12,
      padding: 'var(--pad-card-inner)',
      borderRadius: 'var(--radius-lg)',
      background: 'var(--lm-sky-100)',
      fontFamily: 'var(--font-ui)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-bold)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wide)',
      color: 'var(--lm-linkedin)'
    }
  }, "LinkedIn mention"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      fontSize: 'var(--text-sm)',
      lineHeight: 'var(--leading-body)',
      color: 'var(--text-body)'
    }
  }, "Mentioned by ", authorName, " \u2022 ", authorHeadline), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "linkedin",
    size: "sm",
    onClick: onOpen,
    style: {
      marginTop: 12
    }
  }, "View original post"));
}
Object.assign(__ds_scope, { LinkedInMentionCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/events/LinkedInMentionCard.jsx", error: String((e && e.message) || e) }); }

// components/events/PlatformBadge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const BADGES = {
  LUMA: {
    label: '💼 lu.ma',
    tint: 'var(--lm-sky-100)'
  },
  PARTIFUL: {
    label: '🎉 partiful',
    tint: 'var(--lm-peach-100)'
  },
  LINKEDIN: {
    label: '💼 linkedin',
    tint: 'var(--lm-sky-100)'
  },
  EVENTBRITE: {
    label: '🎫 eventbrite',
    tint: 'var(--lm-butter-100)'
  }
};
function PlatformBadge({
  platform,
  style,
  ...rest
}) {
  const badge = BADGES[platform] || {
    label: platform,
    tint: 'var(--lm-alpha-06)'
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      whiteSpace: 'nowrap',
      flex: '0 0 auto',
      background: badge.tint,
      borderRadius: 'var(--radius-full)',
      padding: '4px 10px',
      fontFamily: 'var(--font-ui)',
      fontSize: 'var(--text-meta)',
      fontWeight: 'var(--weight-bold)',
      letterSpacing: 'var(--tracking-wide)',
      color: 'var(--text-body)',
      ...style
    }
  }, rest), badge.label);
}
Object.assign(__ds_scope, { PlatformBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/events/PlatformBadge.jsx", error: String((e && e.message) || e) }); }

// components/events/EventCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function EventCard({
  event = {},
  selected = false,
  onSelect,
  onOpenLink,
  style,
  ...rest
}) {
  const {
    title,
    venue_name,
    source_platform,
    is_residential,
    attendee_count,
    linkedin_match_count = 0,
    match_preview = [],
    guest_list_public,
    friends = [],
    otherCount = 0,
    original_author_name,
    original_author_headline
  } = event;
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: onSelect,
    style: {
      padding: 'var(--pad-card)',
      borderRadius: 'var(--radius-xl)',
      background: 'var(--surface-card)',
      border: `2px solid ${selected ? 'var(--accent)' : 'transparent'}`,
      boxShadow: selected ? 'var(--shadow-raised)' : 'var(--shadow-card)',
      fontFamily: 'var(--font-ui)',
      cursor: onSelect ? 'pointer' : 'default',
      transition: 'border-color var(--dur-base) var(--ease-standard), box-shadow var(--dur-base) var(--ease-standard)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.PlatformBadge, {
    platform: source_platform
  }), is_residential && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-micro)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--text-muted)',
      background: 'var(--lm-alpha-06)',
      borderRadius: 'var(--radius-full)',
      padding: '4px 9px'
    }
  }, "neighborhood (blurred)")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-lg)',
      fontWeight: 'var(--weight-semibold)',
      letterSpacing: 'var(--tracking-display)',
      color: 'var(--text-primary)',
      lineHeight: 'var(--leading-snug)'
    }
  }, title), venue_name && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4,
      fontSize: 'var(--text-xs)',
      color: 'var(--text-tertiary)'
    }
  }, venue_name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--gap-stat)',
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.StatBlock, {
    value: attendee_count,
    label: "dabei"
  }), /*#__PURE__*/React.createElement(__ds_scope.StatBlock, {
    value: linkedin_match_count,
    label: "LinkedIn-Match"
  })), match_preview.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      fontSize: 'var(--text-meta)',
      color: 'var(--text-muted)'
    }
  }, "z. B. ", match_preview.slice(0, 3).join(', '), guest_list_public === false ? '' : ' · Namens-Match'), /*#__PURE__*/React.createElement(__ds_scope.FriendAvatarStack, {
    friends: friends,
    extraCount: otherCount,
    style: {
      marginTop: 12
    }
  }), source_platform === 'LINKEDIN' && /*#__PURE__*/React.createElement(__ds_scope.LinkedInMentionCard, {
    authorName: original_author_name ?? 'Unknown',
    authorHeadline: original_author_headline ?? 'LinkedIn',
    onOpen: onOpenLink
  }), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "primary",
    block: true,
    onClick: onOpenLink,
    style: {
      marginTop: 16
    }
  }, "Open Event Link"));
}
Object.assign(__ds_scope, { EventCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/events/EventCard.jsx", error: String((e && e.message) || e) }); }

// components/map/MapPin.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function MapPin({
  kind = 'public',
  selected = false,
  style,
  onClick,
  ...rest
}) {
  const residential = kind === 'residential';
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: onClick,
    style: {
      position: 'relative',
      width: residential ? 84 : 32,
      height: residential ? 84 : 32,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: onClick ? 'pointer' : 'default',
      ...style
    }
  }, rest), residential ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      width: 'var(--pin-blur-outer)',
      height: 'var(--pin-blur-outer)',
      borderRadius: '50%',
      background: 'var(--accent)',
      opacity: 0.18,
      filter: 'blur(12px)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      width: 'var(--pin-blur-inner)',
      height: 'var(--pin-blur-inner)',
      borderRadius: '50%',
      background: 'var(--accent)',
      opacity: 0.38,
      filter: 'blur(7px)'
    }
  })) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      width: 'var(--pin-halo)',
      height: 'var(--pin-halo)',
      borderRadius: '50%',
      background: 'var(--accent-soft)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      width: 'var(--pin-core)',
      height: 'var(--pin-core)',
      borderRadius: '50%',
      background: 'var(--accent)',
      boxShadow: `0 0 0 3px var(--lm-paper-white), 0 2px 6px rgba(36,30,51,.18)${selected ? ', 0 0 0 8px var(--accent-glow)' : ''}`
    }
  })));
}
Object.assign(__ds_scope, { MapPin });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/map/MapPin.jsx", error: String((e && e.message) || e) }); }

// components/navigation/ModeSwitch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const OPTIONS = [{
  mode: 'WORK',
  label: '💼 WORK'
}, {
  mode: 'PARTY',
  label: '🔥 PARTY'
}];
function ModeSwitch({
  mode = 'WORK',
  onChange,
  style,
  ...rest
}) {
  const index = mode === 'WORK' ? 0 : 1;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'inline-flex',
      position: 'relative',
      padding: 4,
      borderRadius: 'var(--radius-full)',
      border: 'var(--stroke) solid var(--border-soft)',
      background: 'var(--surface-chrome)',
      backdropFilter: 'var(--blur-backdrop)',
      boxShadow: 'var(--shadow-card)',
      overflow: 'hidden',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      top: 4,
      bottom: 4,
      left: 4,
      width: 'var(--segment-width)',
      borderRadius: 'var(--radius-full)',
      background: 'var(--accent)',
      transform: `translateX(calc(${index} * var(--segment-width)))`,
      transition: 'transform var(--dur-spring) var(--ease-spring), background var(--dur-base) var(--ease-standard)'
    }
  }), OPTIONS.map(option => {
    const active = option.mode === mode;
    return /*#__PURE__*/React.createElement("button", {
      key: option.mode,
      type: "button",
      onClick: () => onChange && onChange(option.mode),
      style: {
        position: 'relative',
        width: 'var(--segment-width)',
        padding: '10px 0',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'var(--font-ui)',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--weight-bold)',
        letterSpacing: 'var(--tracking-wide)',
        color: active ? 'var(--accent-ink)' : 'var(--text-tertiary)',
        transition: 'color var(--dur-base) var(--ease-standard)'
      }
    }, option.label);
  }));
}
Object.assign(__ds_scope, { ModeSwitch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/ModeSwitch.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/BottomSheet.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function BottomSheet({
  title,
  subtitle,
  height = '58%',
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height,
      background: 'var(--surface-sheet)',
      backdropFilter: 'var(--blur-backdrop)',
      borderTopLeftRadius: 'var(--radius-sheet)',
      borderTopRightRadius: 'var(--radius-sheet)',
      boxShadow: 'var(--shadow-sheet)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-ui)',
      overflow: 'hidden',
      transition: 'height var(--dur-sheet) var(--ease-spring)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      padding: '10px 0 6px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 5,
      borderRadius: 'var(--radius-full)',
      background: 'var(--lm-alpha-14)'
    }
  })), (title || subtitle) && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '2px var(--pad-screen-x) 10px'
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-xl)',
      fontWeight: 'var(--weight-semibold)',
      letterSpacing: 'var(--tracking-display)',
      color: 'var(--text-primary)'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-tertiary)',
      marginTop: 2
    }
  }, subtitle)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '0 var(--pad-screen-x) var(--space-10)'
    }
  }, children));
}
Object.assign(__ds_scope, { BottomSheet });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/BottomSheet.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lumap-app/App.jsx
try { (() => {
function LuMapApp() {
  const [mode, setMode] = React.useState('WORK');
  const [selectedId, setSelectedId] = React.useState('luma-1');
  const [settings, setSettings] = React.useState(false);
  const [sheet, setSheet] = React.useState('54%');
  const cycle = () => setSheet(h => h === '54%' ? '78%' : h === '78%' ? '30%' : '54%');
  return /*#__PURE__*/React.createElement("div", {
    "data-mode": mode.toLowerCase(),
    style: {
      position: 'relative',
      width: 390,
      height: 844,
      borderRadius: 44,
      overflow: 'hidden',
      background: 'var(--surface-canvas)',
      boxShadow: '0 40px 100px rgba(36,30,51,.22), 0 0 0 10px #efeaf6, 0 0 0 11px rgba(36,30,51,.14)'
    }
  }, /*#__PURE__*/React.createElement(MapHome, {
    mode: mode,
    setMode: setMode,
    events: feedEvents,
    selectedId: selectedId,
    onSelect: setSelectedId,
    onOpenSettings: () => setSettings(true),
    sheetHeight: sheet,
    onCycleSheet: undefined
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      top: 0,
      transform: settings ? 'translateY(0)' : 'translateY(100%)',
      transition: 'transform var(--dur-sheet) var(--ease-spring)',
      pointerEvents: settings ? 'auto' : 'none'
    }
  }, /*#__PURE__*/React.createElement(SettingsScreen, {
    onClose: () => setSettings(false)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '50%',
      bottom: 8,
      transform: 'translateX(-50%)',
      width: 134,
      height: 5,
      borderRadius: 999,
      background: 'var(--lm-alpha-30)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: cycle,
    title: "Cycle sheet snap point",
    style: {
      position: 'absolute',
      right: 14,
      bottom: 26,
      width: 34,
      height: 34,
      borderRadius: 999,
      border: '1px solid var(--border-strong)',
      background: 'var(--surface-chrome)',
      backdropFilter: 'var(--blur-backdrop)',
      color: 'var(--text-primary)',
      cursor: 'pointer',
      fontSize: 13
    }
  }, "\u2195"));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(LuMapApp, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lumap-app/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lumap-app/MapCanvas.jsx
try { (() => {
// Stand-in for the map canvas. The real app renders Mapbox; no token is
// available here, so this is a pastel paper map at the same value range.
// Do not treat it as brand artwork.
const blocks = [{
  l: 3,
  t: 4,
  w: 17,
  h: 11
}, {
  l: 23,
  t: 3,
  w: 14,
  h: 9
}, {
  l: 40,
  t: 5,
  w: 19,
  h: 10
}, {
  l: 63,
  t: 2,
  w: 15,
  h: 12
}, {
  l: 82,
  t: 6,
  w: 16,
  h: 9
}, {
  l: 2,
  t: 19,
  w: 15,
  h: 13
}, {
  l: 21,
  t: 17,
  w: 18,
  h: 11,
  k: 'p'
}, {
  l: 43,
  t: 20,
  w: 13,
  h: 10
}, {
  l: 60,
  t: 18,
  w: 20,
  h: 13
}, {
  l: 84,
  t: 21,
  w: 14,
  h: 11
}, {
  l: 4,
  t: 37,
  w: 19,
  h: 12
}, {
  l: 27,
  t: 35,
  w: 14,
  h: 10
}, {
  l: 46,
  t: 38,
  w: 17,
  h: 11,
  k: 'p'
}, {
  l: 68,
  t: 36,
  w: 15,
  h: 13
}, {
  l: 87,
  t: 39,
  w: 12,
  h: 10
}, {
  l: 3,
  t: 62,
  w: 16,
  h: 12
}, {
  l: 23,
  t: 64,
  w: 19,
  h: 10
}, {
  l: 47,
  t: 61,
  w: 14,
  h: 13
}, {
  l: 65,
  t: 65,
  w: 18,
  h: 11,
  k: 'p'
}, {
  l: 86,
  t: 62,
  w: 13,
  h: 12
}, {
  l: 8,
  t: 80,
  w: 18,
  h: 12
}, {
  l: 32,
  t: 82,
  w: 15,
  h: 10
}, {
  l: 55,
  t: 79,
  w: 20,
  h: 13
}, {
  l: 79,
  t: 83,
  w: 16,
  h: 11
}];
function MapCanvas({
  mode,
  children
}) {
  const water = mode === 'WORK' ? '#D8E4FF' : '#D6F0E4';
  const park = mode === 'WORK' ? '#DDF2E9' : '#FBEDC9';
  const paper = mode === 'WORK' ? '#E4E9F7' : '#F2E7DA';
  const road = 'rgba(255,255,255,0.95)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      background: paper
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '-16%',
      top: '50%',
      width: '134%',
      height: 62,
      background: water,
      transform: 'rotate(-6deg)',
      borderRadius: 40
    }
  }), [[8, 6], [30, -4], [53, 5], [76, -3]].map(([t, r], i) => /*#__PURE__*/React.createElement("div", {
    key: 'h' + i,
    style: {
      position: 'absolute',
      left: '-12%',
      top: t + '%',
      width: '134%',
      height: i % 2 ? 6 : 9,
      background: road,
      transform: `rotate(${r}deg)`
    }
  })), [[18, 4], [41, -5], [58, 3], [81, -4]].map(([l, r], i) => /*#__PURE__*/React.createElement("div", {
    key: 'v' + i,
    style: {
      position: 'absolute',
      left: l + '%',
      top: '-12%',
      height: '134%',
      width: i % 2 ? 6 : 9,
      background: road,
      transform: `rotate(${r}deg)`
    }
  })), blocks.map((b, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      position: 'absolute',
      left: b.l + '%',
      top: b.t + '%',
      width: b.w + '%',
      height: b.h + '%',
      background: b.k === 'p' ? park : 'var(--lm-paper-white)',
      borderRadius: 8,
      opacity: 0.92
    }
  })), children);
}
Object.assign(window, {
  MapCanvas
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lumap-app/MapCanvas.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lumap-app/MapHome.jsx
try { (() => {
const {
  ModeSwitch,
  Button,
  BottomSheet,
  EventCard,
  MapPin
} = window.LuMapDesignSystem_437202;
function StatusBar() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 22px 0',
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--text-primary)',
      letterSpacing: '.01em'
    }
  }, /*#__PURE__*/React.createElement("span", null, "21:04"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 5,
      alignItems: 'center',
      opacity: .9
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11
    }
  }, "\u25AE\u25AE\u25AE"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11
    }
  }, "\u25D7"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11
    }
  }, "\u25B0")));
}
function MapHome({
  mode,
  setMode,
  events,
  selectedId,
  onSelect,
  onOpenSettings,
  sheetHeight,
  onCycleSheet
}) {
  const visible = events.filter(e => e.mode === mode);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--surface-canvas)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(MapCanvas, {
    mode: mode
  }, visible.map(e => /*#__PURE__*/React.createElement("div", {
    key: e.id,
    style: {
      position: 'absolute',
      left: e.x + '%',
      top: e.y + '%',
      transform: 'translate(-50%,-50%)'
    }
  }, /*#__PURE__*/React.createElement(MapPin, {
    kind: e.is_residential ? 'residential' : 'public',
    selected: e.id === selectedId,
    onClick: () => onSelect(e.id)
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0
    }
  }, /*#__PURE__*/React.createElement(StatusBar, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      padding: '10px 16px 0'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "chrome",
    size: "sm",
    onClick: onOpenSettings
  }, "Settings"), /*#__PURE__*/React.createElement(ModeSwitch, {
    mode: mode,
    onChange: setMode
  }))), /*#__PURE__*/React.createElement(BottomSheet, {
    title: "Live Radar",
    subtitle: `${visible.length} events · ${mode}`,
    height: sheetHeight
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onCycleSheet,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--gap-card)'
    }
  }, visible.map(e => /*#__PURE__*/React.createElement(EventCard, {
    key: e.id,
    event: e,
    selected: e.id === selectedId,
    onSelect: () => onSelect(e.id),
    onOpenLink: () => {}
  })), visible.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      textAlign: 'center',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)'
    }
  }, "No events for ", mode, " yet."))));
}
Object.assign(window, {
  MapHome,
  StatusBar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lumap-app/MapHome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lumap-app/SettingsScreen.jsx
try { (() => {
const {
  Button,
  TextField,
  SectionLabel
} = window.LuMapDesignSystem_437202;
function SettingsScreen({
  onClose
}) {
  const [url, setUrl] = React.useState('https://lu.ma/ai-builders-berlin');
  const [contacts, setContacts] = React.useState(0);
  const [status, setStatus] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const run = fn => {
    setBusy(true);
    setStatus(null);
    setTimeout(() => {
      fn();
      setBusy(false);
    }, 700);
  };
  const P = {
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--leading-body)',
    color: 'var(--text-secondary)',
    margin: '0 0 12px'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--surface-canvas)',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement(StatusBar, null), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '16px',
      fontFamily: 'var(--font-ui)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-xl)',
      fontWeight: 'var(--weight-semibold)',
      letterSpacing: 'var(--tracking-display)',
      color: 'var(--text-primary)'
    }
  }, "Einstellungen"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--accent)',
      fontWeight: 'var(--weight-semibold)',
      fontSize: 'var(--text-sm)',
      fontFamily: 'var(--font-ui)'
    }
  }, "Fertig")), /*#__PURE__*/React.createElement(SectionLabel, {
    style: {
      marginBottom: 8
    }
  }, "LinkedIn"), /*#__PURE__*/React.createElement("p", {
    style: P
  }, "Desktop LinkedIn \u2192 Settings \u2192 Data privacy \u2192 Get a copy of your data \u2192 Connections \u2192 CSV hier hochladen. Kein Scraping."), /*#__PURE__*/React.createElement("p", {
    style: {
      ...P,
      color: 'var(--text-body)'
    }
  }, "Importiert: ", contacts, " Kontakte"), /*#__PURE__*/React.createElement(Button, {
    block: true,
    disabled: busy,
    style: {
      marginBottom: 24
    },
    onClick: () => run(() => {
      setContacts(1284);
      setStatus('1284 Kontakte importiert · 37 Overlaps');
    })
  }, "Connections.csv hochladen"), /*#__PURE__*/React.createElement(SectionLabel, {
    style: {
      marginBottom: 8
    }
  }, "Luma"), /*#__PURE__*/React.createElement("p", {
    style: P
  }, "\xD6ffentliche Event-URL einf\xFCgen. Guest-Namen nur wenn die Liste \xF6ffentlich ist."), /*#__PURE__*/React.createElement(TextField, {
    value: url,
    onChange: e => setUrl(e.target.value),
    placeholder: "https://lu.ma/...",
    style: {
      marginBottom: 12
    }
  }), /*#__PURE__*/React.createElement(Button, {
    block: true,
    disabled: busy,
    style: {
      marginBottom: 12
    },
    onClick: () => run(() => setStatus('Event gespeichert · 64 Gäste · Overlaps 9'))
  }, "Luma-Event syncen"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    block: true,
    disabled: busy,
    style: {
      marginBottom: 24
    },
    onClick: () => run(() => setStatus('Overlaps neu berechnet: 37'))
  }, "Overlaps neu matchen"), busy ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--accent)'
    }
  }, "\u2026") : status ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-secondary)'
    }
  }, status) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32,
      fontSize: 'var(--text-xs)',
      color: 'var(--text-faint)'
    }
  }, "Namens-Matches sind nicht verifiziert (Kollisionen m\xF6glich).")));
}
Object.assign(window, {
  SettingsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lumap-app/SettingsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lumap-app/feedEvents.jsx
try { (() => {
// Mock feed — mirrors src/data/mockFeedEvents.ts verbatim, plus the enriched
// fields the Supabase view supplies (attendee_count, linkedin_match_count…).
const friends = [{
  id: 'f1',
  display_name: 'Mira',
  avatar_url: null
}, {
  id: 'f2',
  display_name: 'Jonas',
  avatar_url: null
}, {
  id: 'f3',
  display_name: 'Lea',
  avatar_url: null
}];
const feedEvents = [{
  id: 'luma-1',
  title: 'AI Builders Meetup',
  source_platform: 'LUMA',
  mode: 'WORK',
  venue_name: 'Factory Berlin',
  is_residential: false,
  x: 30,
  y: 20,
  attendee_count: 128,
  linkedin_match_count: 9,
  match_preview: ['Sara Klein', 'Tom Reuter', 'Nina Fuchs'],
  guest_list_public: true,
  friends: friends.slice(0, 2),
  otherCount: 4,
  original_author_name: null,
  original_author_headline: null
}, {
  id: 'li-1',
  title: 'Speaking at Climate Tech Summit',
  source_platform: 'LINKEDIN',
  mode: 'WORK',
  venue_name: 'Station Berlin',
  is_residential: false,
  x: 68,
  y: 33,
  attendee_count: 340,
  linkedin_match_count: 14,
  match_preview: ['Sara Klein', 'Paul Adam'],
  guest_list_public: false,
  friends: [friends[0]],
  otherCount: 2,
  original_author_name: 'Sara Klein',
  original_author_headline: 'Partner @ Green Ventures'
}, {
  id: 'party-1',
  title: 'Rooftop Summer Session',
  source_platform: 'PARTIFUL',
  mode: 'PARTY',
  venue_name: 'Apt 4B · Kreuzberg',
  is_residential: true,
  x: 46,
  y: 31,
  attendee_count: 38,
  linkedin_match_count: 2,
  match_preview: ['Mira K.', 'Jonas B.'],
  guest_list_public: true,
  friends: friends,
  otherCount: 11,
  original_author_name: null,
  original_author_headline: null
}, {
  id: 'party-2',
  title: 'Vinyl & Natural Wine',
  source_platform: 'PARTIFUL',
  mode: 'PARTY',
  venue_name: 'OHM Berlin',
  is_residential: false,
  x: 74,
  y: 17,
  attendee_count: 62,
  linkedin_match_count: 3,
  match_preview: ['Lea M.'],
  guest_list_public: true,
  friends: friends.slice(1),
  otherCount: 6,
  original_author_name: null,
  original_author_headline: null
}, {
  id: 'party-3',
  title: 'Basement Techno · Guestlist',
  source_platform: 'PARTIFUL',
  mode: 'PARTY',
  venue_name: 'Neukölln',
  is_residential: true,
  x: 20,
  y: 36,
  attendee_count: 91,
  linkedin_match_count: 0,
  match_preview: [],
  guest_list_public: false,
  friends: [friends[2]],
  otherCount: 19,
  original_author_name: null,
  original_author_headline: null
}, {
  id: 'luma-2',
  title: 'Founders Coffee · Mitte',
  source_platform: 'LUMA',
  mode: 'WORK',
  venue_name: 'Oslo Kaffebar',
  is_residential: false,
  x: 22,
  y: 20,
  attendee_count: 24,
  linkedin_match_count: 6,
  match_preview: ['Tom Reuter'],
  guest_list_public: true,
  friends: [friends[1]],
  otherCount: 1,
  original_author_name: null,
  original_author_headline: null
}];
Object.assign(window, {
  feedEvents
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lumap-app/feedEvents.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.SectionLabel = __ds_scope.SectionLabel;

__ds_ns.StatBlock = __ds_scope.StatBlock;

__ds_ns.TextField = __ds_scope.TextField;

__ds_ns.EventCard = __ds_scope.EventCard;

__ds_ns.FriendAvatarStack = __ds_scope.FriendAvatarStack;

__ds_ns.LinkedInMentionCard = __ds_scope.LinkedInMentionCard;

__ds_ns.PlatformBadge = __ds_scope.PlatformBadge;

__ds_ns.MapPin = __ds_scope.MapPin;

__ds_ns.ModeSwitch = __ds_scope.ModeSwitch;

__ds_ns.BottomSheet = __ds_scope.BottomSheet;

})();
