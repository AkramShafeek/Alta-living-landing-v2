/* @ds-bundle: {"format":4,"namespace":"AltaLivingDesignSystem_f4d977","components":[{"name":"Marquee","sourcePath":"components/board/Marquee.jsx"},{"name":"Pinboard","sourcePath":"components/board/Pinboard.jsx"},{"name":"PinnedPhoto","sourcePath":"components/board/PinnedPhoto.jsx"},{"name":"StickyNote","sourcePath":"components/board/StickyNote.jsx"},{"name":"Accordion","sourcePath":"components/core/Accordion.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"Rule","sourcePath":"components/core/Rule.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"ArchPanel","sourcePath":"components/layout/ArchPanel.jsx"},{"name":"CTABand","sourcePath":"components/layout/CTABand.jsx"},{"name":"NavCapsule","sourcePath":"components/layout/NavCapsule.jsx"},{"name":"PatternField","sourcePath":"components/layout/PatternField.jsx"},{"name":"Wordmark","sourcePath":"components/layout/Wordmark.jsx"},{"name":"FeatureCell","sourcePath":"components/property/FeatureCell.jsx"},{"name":"PropertyCard","sourcePath":"components/property/PropertyCard.jsx"},{"name":"StatBlock","sourcePath":"components/property/StatBlock.jsx"},{"name":"StepCell","sourcePath":"components/property/StepCell.jsx"},{"name":"TestimonialCard","sourcePath":"components/property/TestimonialCard.jsx"}],"sourceHashes":{"components/board/Marquee.jsx":"9a37c9555b80","components/board/Pinboard.jsx":"39bca4bda0de","components/board/PinnedPhoto.jsx":"5b0369a3720d","components/board/StickyNote.jsx":"0581d7a269d9","components/core/Accordion.jsx":"cc2f12232c8a","components/core/Button.jsx":"5a96c3bc67ed","components/core/Icon.jsx":"fcabfaba594a","components/core/Rule.jsx":"ee6172641e4b","components/core/Tag.jsx":"fc337ca9214e","components/layout/ArchPanel.jsx":"5c46857e99d2","components/layout/CTABand.jsx":"22c149fff67e","components/layout/NavCapsule.jsx":"83aaaabc872e","components/layout/PatternField.jsx":"f1826ea8473b","components/layout/Wordmark.jsx":"3788835057b0","components/property/FeatureCell.jsx":"4ad8e0b07470","components/property/PropertyCard.jsx":"7f300d48e579","components/property/StatBlock.jsx":"750830570338","components/property/StepCell.jsx":"00e9ea5cd036","components/property/TestimonialCard.jsx":"5c9a27a56e40","ui_kits/marketing-site/Chrome.jsx":"5b3f9a44bcfc","ui_kits/marketing-site/Home.jsx":"39cef5cfcadc","ui_kits/marketing-site/Listings.jsx":"c52dba959af1","ui_kits/marketing-site/PropertyDrawer.jsx":"cdb735ecc8b5"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.AltaLivingDesignSystem_f4d977 = window.AltaLivingDesignSystem_f4d977 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/board/Marquee.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Marquee({
  items = [],
  speed = 26,
  tone = 'rust',
  style,
  ...rest
}) {
  const grounds = {
    rust: {
      background: 'color-mix(in srgb, var(--rust-band) 60%, transparent)',
      color: 'var(--white)'
    },
    ink: {
      background: 'var(--ink)',
      color: 'var(--paper)'
    },
    paper: {
      background: 'var(--paper-2)',
      color: 'var(--ink)'
    }
  };
  const doubled = [...items, ...items];
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      whiteSpace: 'nowrap',
      borderTop: '1px solid var(--ink)',
      borderBottom: '1px solid var(--ink)',
      ...grounds[tone],
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      animation: 'alta-marquee ' + speed + 's linear infinite'
    }
  }, doubled.map((item, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      padding: '12px 28px',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-label)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      marginRight: 10,
      color: 'var(--clay)'
    }
  }, "\u2014"), item))));
}
Object.assign(__ds_scope, { Marquee });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/board/Marquee.jsx", error: String((e && e.message) || e) }); }

// components/board/PinnedPhoto.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function PinnedPhoto({
  src,
  alt = '',
  width = 176,
  height = 132,
  rotate,
  seed = 0,
  caption,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const s = seed % 100;
  const baseRotate = rotate !== undefined ? rotate : s / 100 * 10 - 5;
  const r = hover ? baseRotate * 0.4 : baseRotate;
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 10,
      marginBottom: -4,
      width: 12,
      height: 12,
      borderRadius: '50%',
      background: 'radial-gradient(circle at 30% 30%, #f87171, #991b1b 60%, #5f1414)',
      border: '1px solid var(--rust)',
      boxShadow: '0 1px 2px rgba(0,0,0,.6)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      background: 'var(--paper-2)',
      border: '1px solid var(--ink)',
      overflow: 'hidden',
      transform: 'perspective(800px) rotateX(3deg) rotate(' + r + 'deg)',
      transformOrigin: 'top center',
      transition: 'transform 150ms ease-out, box-shadow 250ms ease-out',
      boxShadow: hover ? 'var(--shadow-pinned-hover)' : 'var(--shadow-pinned)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height,
      padding: 4
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: alt,
    draggable: false,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 24,
      background: 'var(--white)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 6px',
      fontFamily: 'var(--font-hand)',
      fontSize: 12,
      color: 'rgba(17,17,17,.7)'
    }
  }, caption)));
}
Object.assign(__ds_scope, { PinnedPhoto });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/board/PinnedPhoto.jsx", error: String((e && e.message) || e) }); }

// components/board/StickyNote.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function StickyNote({
  children,
  rotate = -4,
  width = 112,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: 'var(--rust)',
      marginBottom: -4,
      zIndex: 10,
      boxShadow: '0 1px 2px rgba(0,0,0,.4)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      transform: 'rotate(' + rotate + 'deg)',
      background: 'var(--note)',
      border: '1px solid rgba(17,17,17,.4)',
      boxShadow: 'var(--shadow-note)',
      padding: '8px 12px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-hand)',
      fontSize: 14,
      lineHeight: 1.35,
      color: 'rgba(17,17,17,.7)',
      whiteSpace: 'pre-line'
    }
  }, children)));
}
Object.assign(__ds_scope, { StickyNote });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/board/StickyNote.jsx", error: String((e && e.message) || e) }); }

// components/board/Pinboard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Notes are placed in % of the container; connections draw rust strings between them.
function Pinboard({
  notes = [],
  connections = [],
  animate = true,
  children,
  style,
  ...rest
}) {
  const ref = React.useRef(null);
  const [size, setSize] = React.useState({
    width: 0,
    height: 0
  });
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({
      width: e.contentRect.width,
      height: e.contentRect.height
    }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const byId = Object.fromEntries(notes.map(n => [n.id, n]));
  const notesDoneAt = 0.25 * (notes.length - 1) + 0.5;
  return /*#__PURE__*/React.createElement("div", _extends({
    ref: ref,
    style: {
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      ...style
    }
  }, rest), size.width > 0 && /*#__PURE__*/React.createElement("svg", {
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%'
    },
    viewBox: '0 0 ' + size.width + ' ' + size.height
  }, connections.map(([a, b], i) => {
    const from = byId[a],
      to = byId[b];
    if (!from || !to) return null;
    const fx = from.x / 100 * size.width,
      fy = from.y / 100 * size.height;
    const tx = to.x / 100 * size.width,
      ty = to.y / 100 * size.height;
    const mx = (fx + tx) / 2 + (i % 2 === 0 ? 24 : -24);
    const my = (fy + ty) / 2 + (i % 2 === 0 ? -18 : 18);
    const d = 'M ' + fx + ' ' + fy + ' Q ' + mx + ' ' + my + ' ' + tx + ' ' + ty;
    return /*#__PURE__*/React.createElement("path", {
      key: i,
      d: d,
      fill: "none",
      stroke: "var(--rust)",
      strokeWidth: "1.2",
      style: animate ? {
        strokeDasharray: 2000,
        strokeDashoffset: 2000,
        animation: 'alta-draw 900ms cubic-bezier(0.4,0,0.2,1) forwards',
        animationDelay: notesDoneAt + i * 0.15 + 's'
      } : undefined
    });
  })), notes.map((n, i) => /*#__PURE__*/React.createElement("div", {
    key: n.id,
    style: {
      position: 'absolute',
      left: n.x + '%',
      top: n.y + '%',
      transform: 'translate(-50%,-50%)',
      opacity: animate ? 0 : 1,
      animation: animate ? 'alta-note-land 500ms var(--ease-out) forwards' : undefined,
      animationDelay: animate ? i * 0.25 + 's' : undefined
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.StickyNote, {
    rotate: n.rotate
  }, n.text))), children);
}
Object.assign(__ds_scope, { Pinboard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/board/Pinboard.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Lucide (lucide-react in source) served as static SVG from CDN — brand icon set.
const CDN = 'https://cdn.jsdelivr.net/npm/lucide-static@0.544.0/icons/';
function Icon({
  name,
  size = 16,
  color = 'currentColor',
  strokeWidth,
  style,
  ...rest
}) {
  const px = typeof size === 'number' ? size + 'px' : size;
  return /*#__PURE__*/React.createElement("span", _extends({
    "aria-hidden": "true",
    style: {
      display: 'inline-block',
      width: px,
      height: px,
      flex: '0 0 auto',
      background: color,
      WebkitMaskImage: 'url(' + CDN + name + '.svg)',
      maskImage: 'url(' + CDN + name + '.svg)',
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
      WebkitMaskSize: 'contain',
      maskSize: 'contain',
      WebkitMaskPosition: 'center',
      maskPosition: 'center',
      ...style
    },
    "data-icon": name,
    "data-stroke": strokeWidth
  }, rest));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/Accordion.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Accordion({
  items = [],
  defaultOpen = -1,
  style,
  ...rest
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      borderTop: '1px solid var(--ink)',
      ...style
    }
  }, rest), items.map((it, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      borderBottom: '1px solid var(--ink)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setOpen(open === i ? -1 : i),
    style: {
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 16,
      padding: '18px 4px',
      background: 'none',
      border: 'none',
      textAlign: 'left',
      cursor: 'pointer',
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 20,
      color: 'var(--ink)'
    }
  }, it.q, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: open === i ? 'minus' : 'plus',
    size: 18
  })), open === i ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      padding: '0 4px 20px',
      maxWidth: '70ch',
      fontSize: 'var(--fs-body-sm)',
      lineHeight: 1.65,
      color: 'var(--ink-soft)'
    }
  }, it.a) : null)));
}
Object.assign(__ds_scope, { Accordion });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Accordion.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const base = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  whiteSpace: 'nowrap',
  border: '1px solid transparent',
  background: 'none',
  color: 'var(--ink)',
  transition: 'background var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-instant) var(--ease-standard), transform var(--dur-instant) var(--ease-standard)'
};
const sizes = {
  sm: {
    height: 32,
    padding: '0 12px',
    fontSize: 13
  },
  md: {
    height: 40,
    padding: '0 18px',
    fontSize: 14
  },
  lg: {
    height: 56,
    padding: '0 28px',
    fontSize: 16
  }
};
function Button({
  children,
  variant = 'hard',
  size = 'md',
  shape = 'square',
  iconStart,
  iconEnd,
  block = false,
  disabled = false,
  justify,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const hard = variant === 'hard' || variant === 'hard-invert';
  const skin = {
    hard: {
      background: hover ? 'var(--ink)' : 'var(--white)',
      color: hover ? 'var(--paper)' : 'var(--ink)',
      borderColor: 'var(--ink)'
    },
    'hard-invert': {
      background: hover ? 'var(--white)' : 'var(--ink)',
      color: hover ? 'var(--ink)' : 'var(--paper)',
      borderColor: 'var(--ink)'
    },
    solid: {
      background: hover ? 'var(--ink-soft)' : 'var(--ink)',
      color: 'var(--paper)',
      borderColor: 'var(--ink)'
    },
    outline: {
      background: hover ? 'var(--paper-2)' : 'transparent',
      color: 'var(--ink)',
      borderColor: 'var(--ink)'
    },
    ghost: {
      background: hover ? 'rgba(17,17,17,.06)' : 'transparent',
      color: 'var(--ink)',
      borderColor: 'transparent'
    },
    link: {
      background: 'transparent',
      color: hover ? 'var(--rust)' : 'var(--ink)',
      borderColor: 'transparent',
      textDecoration: hover ? 'underline' : 'none',
      textUnderlineOffset: '3px',
      padding: '0 4px'
    }
  }[variant];
  const radius = shape === 'pill' ? 'var(--radius-pill)' : 'var(--radius-0)';
  const offset = press ? 'var(--press-offset)' : '0px';
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      ...base,
      ...sizes[size],
      ...skin,
      borderRadius: radius,
      width: block ? '100%' : undefined,
      justifyContent: justify || (block && variant === 'hard' ? 'space-between' : 'center'),
      boxShadow: hard && !disabled ? press ? '2px 2px 0 var(--ink)' : 'var(--shadow-hard)' : 'none',
      transform: hard && press ? 'translate(' + offset + ',' + offset + ')' : 'none',
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
      ...style
    }
  }, rest), iconStart ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconStart,
    size: size === 'sm' ? 14 : 16
  }) : null, children, iconEnd ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconEnd,
    size: size === 'sm' ? 14 : 16
  }) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Rule.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Rule({
  orientation = 'horizontal',
  weight = 'soft',
  style,
  ...rest
}) {
  const color = weight === 'hard' ? 'var(--ink)' : 'var(--border-soft)';
  const w = weight === 'thick' ? 2 : 1;
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "separator",
    style: orientation === 'vertical' ? {
      width: w,
      alignSelf: 'stretch',
      background: weight === 'thick' ? 'var(--ink)' : color,
      ...style
    } : {
      height: w,
      width: '100%',
      background: weight === 'thick' ? 'var(--ink)' : color,
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Rule });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Rule.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const tones = {
  ink: {
    background: 'var(--ink)',
    color: 'var(--white)'
  },
  paper: {
    background: 'var(--paper-2)',
    color: 'var(--ink)'
  },
  wash: {
    background: 'var(--pastel-blue-deep)',
    color: 'var(--ink)'
  },
  rust: {
    background: 'var(--rust)',
    color: 'var(--paper)'
  },
  outline: {
    background: 'transparent',
    color: 'var(--ink)',
    border: '1px solid var(--ink)'
  },
  glass: {
    background: 'rgba(0,0,0,.5)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,.2)',
    backdropFilter: 'blur(4px)',
    borderRadius: 'var(--radius-pill)'
  }
};
function Tag({
  children,
  tone = 'ink',
  icon,
  mono = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 8px',
      fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)',
      fontSize: 'var(--fs-label)',
      fontWeight: 500,
      lineHeight: 1.2,
      letterSpacing: mono ? '0.06em' : 0,
      borderRadius: 'var(--radius-0)',
      ...tones[tone],
      ...style
    }
  }, rest), icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 12
  }) : null, children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/layout/ArchPanel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ArchPanel({
  title,
  action,
  children,
  pad = 64,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("section", _extends({
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 32,
      alignItems: 'stretch',
      padding: pad,
      paddingBottom: 48,
      border: '1px solid var(--paper-3)',
      borderTopLeftRadius: 'var(--radius-arch)',
      borderTopRightRadius: 'var(--radius-arch)',
      borderBottom: 'none',
      ...style
    }
  }, rest), (title || action) && /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      gap: 24
    }
  }, title ? /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 'var(--fs-display)',
      lineHeight: 'var(--lh-tight)',
      letterSpacing: 'var(--tracking-display)'
    }
  }, title) : /*#__PURE__*/React.createElement("span", null), action), children);
}
Object.assign(__ds_scope, { ArchPanel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/ArchPanel.jsx", error: String((e && e.message) || e) }); }

// components/layout/CTABand.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function CTABand({
  title,
  subtitle,
  action = 'Browse Properties',
  onAction,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("section", _extends({
    style: {
      background: 'var(--ink)',
      color: 'var(--paper)',
      padding: '72px 32px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
      textAlign: 'center',
      borderTop: '1px solid var(--ink)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 'var(--fs-display)',
      lineHeight: 'var(--lh-tight)',
      letterSpacing: 'var(--tracking-display)'
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-label)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      opacity: .8
    }
  }, subtitle), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "hard",
    size: "lg",
    shape: "pill",
    onClick: onAction,
    style: {
      marginTop: 12
    }
  }, action));
}
Object.assign(__ds_scope, { CTABand });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/CTABand.jsx", error: String((e && e.message) || e) }); }

// components/layout/NavCapsule.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function NavCapsule({
  items = [],
  active,
  onSelect,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("nav", _extends({
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      background: 'var(--white)',
      border: '1px solid var(--ink)',
      borderRadius: 'var(--radius-pill)',
      padding: '4px 12px',
      boxShadow: '0 2px 4px rgba(0,0,0,.12)',
      ...style
    }
  }, rest), items.map(item => /*#__PURE__*/React.createElement(__ds_scope.Button, {
    key: item,
    variant: "link",
    size: "sm",
    onClick: () => onSelect && onSelect(item),
    style: {
      textDecoration: active === item ? 'underline' : 'none',
      color: active === item ? 'var(--rust)' : 'var(--ink)'
    }
  }, item)));
}
Object.assign(__ds_scope, { NavCapsule });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/NavCapsule.jsx", error: String((e && e.message) || e) }); }

// components/layout/PatternField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function PatternField({
  src = 'assets/pattern-furniture.jpg',
  size = 300,
  opacity = 0.1,
  fadeIn = true,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      inset: 0,
      backgroundImage: 'url(' + src + ')',
      backgroundRepeat: 'repeat',
      backgroundSize: size + 'px ' + size + 'px',
      opacity: fadeIn ? 0 : opacity,
      animation: fadeIn ? 'alta-pattern-in var(--dur-wash) var(--ease-standard) forwards' : undefined,
      ['--alta-pattern-opacity']: opacity,
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { PatternField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/PatternField.jsx", error: String((e && e.message) || e) }); }

// components/layout/Wordmark.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Wordmark({
  variant = 'lockup',
  size = 48,
  boxed = true,
  style,
  ...rest
}) {
  if (variant === 'mark') {
    return /*#__PURE__*/React.createElement("img", _extends({
      src: "assets/alta-logo.png",
      alt: "Alta Living",
      style: {
        width: size,
        height: size,
        border: boxed ? '1px solid var(--ink)' : 'none',
        borderRadius: boxed ? 'var(--radius-md)' : 0,
        boxShadow: boxed ? 'var(--shadow-hard-sm)' : 'none',
        background: 'var(--white)',
        display: 'block',
        ...style
      }
    }, rest));
  }
  if (variant === 'condensed') {
    return /*#__PURE__*/React.createElement("span", _extends({
      style: {
        fontFamily: 'var(--font-wordmark)',
        fontSize: size,
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
        lineHeight: 1,
        ...style
      }
    }, rest), "Alta Living");
  }
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("img", {
    src: "assets/alta-logo.png",
    alt: "",
    style: {
      width: size,
      height: size,
      border: boxed ? '1px solid var(--ink)' : 'none',
      borderRadius: boxed ? 'var(--radius-md)' : 0,
      boxShadow: boxed ? 'var(--shadow-hard-sm)' : 'none',
      background: 'var(--white)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-wordmark)',
      fontSize: size * 0.8,
      textTransform: 'uppercase',
      lineHeight: 1
    }
  }, "Alta Living"));
}
Object.assign(__ds_scope, { Wordmark });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/Wordmark.jsx", error: String((e && e.message) || e) }); }

// components/property/FeatureCell.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function FeatureCell({
  icon = 'check',
  title,
  children,
  tone = 'blue',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      padding: 20,
      background: 'var(--pastel-' + tone + ')',
      border: '1px solid var(--ink)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 22
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 20,
      lineHeight: 1.1
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--fs-body-sm)',
      lineHeight: 1.55,
      color: 'var(--ink-soft)'
    }
  }, children));
}
Object.assign(__ds_scope, { FeatureCell });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/property/FeatureCell.jsx", error: String((e && e.message) || e) }); }

// components/property/PropertyCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function PropertyCard({
  src,
  alt = '',
  title = 'Property Title',
  hook,
  location = 'Bangalore',
  beds = '1BHK',
  availability,
  price = '₹ 30,000',
  unit = 'per night',
  tone = 'blue',
  onView,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minWidth: 320,
      background: 'var(--pastel-' + tone + ')',
      border: '1px solid var(--ink)',
      overflow: 'hidden',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 288,
      borderBottom: '1px solid var(--ink)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: alt,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      padding: 16,
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 24,
      lineHeight: 1.1
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--fs-body-sm)',
      color: 'var(--text-muted)'
    }
  }, hook), /*#__PURE__*/React.createElement(__ds_scope.Rule, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 8,
      fontSize: 'var(--fs-label)',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Tag, {
    icon: "map-pin"
  }, location), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "bed",
    size: 16
  }), beds), availability ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "door-open",
    size: 16
  }), availability) : null), /*#__PURE__*/React.createElement(__ds_scope.Rule, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      padding: 8
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      display: 'flex',
      alignItems: 'baseline',
      gap: 8,
      font: 'var(--type-price)'
    }
  }, price, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-body-sm)',
      fontWeight: 400
    }
  }, unit)))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 16px'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "hard",
    block: true,
    iconEnd: "arrow-right",
    onClick: onView,
    style: {
      borderTop: '1px solid var(--ink)'
    }
  }, "View")));
}
Object.assign(__ds_scope, { PropertyCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/property/PropertyCard.jsx", error: String((e && e.message) || e) }); }

// components/property/StatBlock.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function StatBlock({
  value,
  label,
  size = 'lg',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: 8,
      padding: 16,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 8px',
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: size === 'lg' ? 'var(--fs-stat)' : 40,
      lineHeight: 'var(--lh-tight)',
      letterSpacing: 'var(--tracking-display)'
    }
  }, value), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontWeight: 200,
      fontSize: 'var(--fs-body)',
      textAlign: 'right'
    }
  }, label));
}
Object.assign(__ds_scope, { StatBlock });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/property/StatBlock.jsx", error: String((e && e.message) || e) }); }

// components/property/StepCell.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function StepCell({
  n,
  title,
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      padding: '20px 0',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-label)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)'
    }
  }, "Step ", n), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 34,
      lineHeight: 1
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--fs-body-sm)',
      lineHeight: 1.6,
      color: 'var(--ink-soft)',
      maxWidth: '34ch'
    }
  }, children));
}
Object.assign(__ds_scope, { StepCell });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/property/StepCell.jsx", error: String((e && e.message) || e) }); }

// components/property/TestimonialCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function TestimonialCard({
  quote,
  name = 'Guest Name',
  location = 'Indiranagar, Bangalore',
  rating = 5,
  verified = true,
  tone = 'blue',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minWidth: 300,
      maxWidth: 420,
      background: 'var(--pastel-' + tone + ')',
      border: '1px solid var(--ink)',
      overflow: 'hidden',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      padding: 16,
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 24
    }
  }, name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 2
    }
  }, Array.from({
    length: 5
  }).map((_, i) => /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    key: i,
    name: "star",
    size: 16,
    color: i < rating ? 'var(--ink)' : 'var(--text-muted)'
  })))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--fs-body-sm)',
      lineHeight: 1.6,
      color: 'var(--text-muted)'
    }
  }, quote), /*#__PURE__*/React.createElement(__ds_scope.Rule, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 8,
      fontSize: 'var(--fs-label)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Tag, {
    tone: "outline",
    icon: "map-pin"
  }, location), verified ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "home",
    size: 16
  }), "Verified Stay") : null)));
}
Object.assign(__ds_scope, { TestimonialCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/property/TestimonialCard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/Chrome.jsx
try { (() => {
const {
  Marquee,
  NavCapsule,
  Button
} = window.AltaLivingDesignSystem_f4d977;
function Header({
  page,
  onSelect
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      padding: '16px 32px 0'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/alta-logo.png",
    alt: "Alta Living",
    style: {
      width: 48,
      height: 48,
      background: 'var(--white)',
      border: '1px solid var(--ink)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-hard-sm)'
    }
  }), /*#__PURE__*/React.createElement(NavCapsule, {
    items: ["Listings", "About Us", "Contact"],
    active: page,
    onSelect: onSelect
  }));
}
function TickerBand() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement(Marquee, {
    items: ["14 homes live across bangalore", "new listing — indiranagar 2bhk", "average move-in time — 3 days", "fully furnished, fully photographed"]
  }));
}
const AREAS = ['Indiranagar', 'Koramangala', 'HSR Layout', 'Whitefield', 'Jayanagar', 'Basavanagudi'];
function Footer() {
  const label = {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 'var(--tracking-label)',
    color: 'var(--text-muted)'
  };
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      borderTop: '1px solid var(--ink)',
      padding: '32px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr 1fr 1.4fr',
      gap: 32,
      paddingBottom: 32,
      borderBottom: '1px solid var(--ink)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-wordmark)',
      fontSize: 64,
      textTransform: 'uppercase',
      lineHeight: .9
    }
  }, "Alta Living"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      maxWidth: '34ch',
      fontSize: 14,
      lineHeight: 1.6,
      color: 'var(--ink-soft)'
    }
  }, "Fully serviced homes across Bangalore for people who want to live somewhere, not just stay there.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: label
  }, "Areas"), AREAS.map(a => /*#__PURE__*/React.createElement("a", {
    key: a,
    href: "#",
    style: {
      fontSize: 14,
      textDecoration: 'none'
    }
  }, a))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: label
  }, "Company"), ['About us', 'How it works', 'Contact', 'Careers'].map(a => /*#__PURE__*/React.createElement("a", {
    key: a,
    href: "#",
    style: {
      fontSize: 14,
      textDecoration: 'none'
    }
  }, a))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: label
  }, "Get first dibs on new homes"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 14,
      lineHeight: 1.6,
      color: 'var(--ink-soft)'
    }
  }, "We add addresses a few times a year. Be the first to know."), /*#__PURE__*/React.createElement("form", {
    style: {
      display: 'flex',
      gap: 8
    },
    onSubmit: e => e.preventDefault()
  }, /*#__PURE__*/React.createElement("input", {
    placeholder: "you@email.com",
    style: {
      flex: 1,
      minWidth: 0,
      height: 40,
      padding: '0 12px',
      border: '1px solid var(--ink)',
      background: 'var(--white)',
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      borderRadius: 0
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "hard",
    size: "md",
    iconEnd: "arrow-right"
  }, "Subscribe")))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...label,
      display: 'flex',
      justifyContent: 'space-between',
      gap: 16,
      flexWrap: 'wrap',
      paddingTop: 16
    }
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 Alta Living \xB7 Bangalore"), /*#__PURE__*/React.createElement("span", null, "hello@altaliving.in \xB7 +91 80 XXXX XXXX")));
}
Object.assign(window, {
  Header,
  TickerBand,
  Footer
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/Chrome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/Home.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  Pinboard,
  PinnedPhoto,
  PatternField,
  PropertyCard,
  TestimonialCard,
  StatBlock,
  ArchPanel,
  Button,
  FeatureCell,
  StepCell,
  CTABand,
  Accordion,
  Rule,
  Tag,
  Icon
} = window.AltaLivingDesignSystem_f4d977;
const NOTES = [{
  id: 'a',
  x: 8,
  y: 18,
  rotate: -6,
  text: 'Indiranagar\n2BHK — too small'
}, {
  id: 'b',
  x: 24,
  y: 42,
  rotate: 4,
  text: 'Koramangala\n★ good light'
}, {
  id: 'c',
  x: 15,
  y: 78,
  rotate: -3,
  text: 'Whitefield\ntoo far from work'
}, {
  id: 'd',
  x: 88,
  y: 25,
  rotate: 5,
  text: 'HSR Layout\nnear metro?'
}, {
  id: 'e',
  x: 92,
  y: 48,
  rotate: -4,
  text: 'Budget\n₹30,000 / night'
}, {
  id: 'f',
  x: 80,
  y: 82,
  rotate: 3,
  text: 'Jayanagar\nvisited 12/3 ✓'
}];
const STRINGS = [['a', 'b'], ['b', 'c'], ['b', 'd'], ['d', 'e'], ['e', 'f']];
const COLLAGE = [{
  x: 40,
  y: 100,
  width: 150,
  height: 112,
  seed: 11
}, {
  x: 20,
  y: 300,
  width: 130,
  height: 112,
  seed: 29
}, {
  x: 340,
  y: 250,
  width: 150,
  height: 112,
  seed: 43
}, {
  x: 560,
  y: 70,
  width: 130,
  height: 112,
  seed: 57
}, {
  x: 780,
  y: 160,
  width: 150,
  height: 112,
  seed: 71
}, {
  x: 600,
  y: 320,
  width: 130,
  height: 112,
  seed: 83
}, {
  x: 300,
  y: 440,
  width: 140,
  height: 112,
  seed: 97
}];
const SHOTS = ['1.jpg', '2.jpg', '3.jpg'];
const PICKS = [{
  src: '1.jpg',
  tone: 'blue',
  title: 'The Garden Loft',
  hook: 'A quiet 2BHK above a courtyard, five minutes from 100ft Road.',
  location: 'Indiranagar, Bangalore',
  beds: '2BHK',
  availability: 'Available 1/3',
  price: '₹ 30,000'
}, {
  src: '2.jpg',
  tone: 'sage',
  title: 'The Studio on Vittal Mallya',
  hook: 'A minimalist one-bedroom built for long work stays.',
  location: 'Whitefield, Bangalore',
  beds: '1BHK',
  availability: 'Available 2/3',
  price: '₹ 24,000'
}, {
  src: '3.jpg',
  tone: 'peach',
  title: 'Courtyard House',
  hook: 'Three bedrooms around an open courtyard, ten minutes from the metro.',
  location: 'Jayanagar, Bangalore',
  beds: '3BHK',
  availability: 'Available 1/2',
  price: '₹ 42,000'
}];
const QUOTES = [{
  name: 'Ritika M.',
  location: 'Indiranagar',
  rating: 5,
  tone: 'blue',
  stay: '4 months',
  quote: 'I booked for a quiet weekend and ended up staying four months. Everything worked on day one.'
}, {
  name: 'Devansh K.',
  location: 'Whitefield',
  rating: 5,
  tone: 'sage',
  stay: '6 weeks',
  quote: 'Every other rental I saw looked like a scam by day two. This one looked better in person than in the photos.'
}, {
  name: 'Priya S.',
  location: 'Jayanagar',
  rating: 5,
  tone: 'peach',
  stay: '8 months',
  quote: 'I work remotely and needed a real desk and real internet, not a hotel room. The studio nailed both.'
}, {
  name: 'Arjun T.',
  location: 'HSR Layout',
  rating: 4,
  tone: 'lilac',
  stay: '3 weeks',
  quote: 'Move-in took three days end to end. The local contact answered every single time I called.'
}, {
  name: 'Nandita R.',
  location: 'Koramangala',
  rating: 5,
  tone: 'butter',
  stay: '1 year',
  quote: 'The price was the price. No cleaning fee surprise at checkout, which is rarer than it should be.'
}, {
  name: 'Farhan A.',
  location: 'Basavanagudi',
  rating: 5,
  tone: 'blue',
  stay: '5 months',
  quote: 'Fully furnished actually meant fully furnished — down to a working kettle and a decent mattress.'
}];
const FAQS = [{
  q: 'How is Alta Living different from a listings site?',
  a: 'We manage and vet every home ourselves — we are not an open marketplace. That means consistent quality, photos we took, and one local contact for the length of your stay.'
}, {
  q: "What's included in the rent?",
  a: 'Utilities, Wi-Fi and a full clean before you move in are always included. The number you see is the number you pay.'
}, {
  q: 'What is the shortest stay you take?',
  a: 'A single night, though most guests stay a month or more. The homes are set up for both.'
}, {
  q: 'Is there a deposit?',
  a: 'Yes, a refundable deposit at booking, released within 48 hours of checkout assuming no damage.'
}, {
  q: 'Which parts of Bangalore are you in?',
  a: 'Indiranagar, Koramangala, HSR Layout, Whitefield, Jayanagar and Basavanagudi today, with new addresses added through the year.'
}];
function Hero({
  page,
  onSelect
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      minHeight: 640,
      borderBottom: '1px solid var(--ink)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(PatternField, {
    src: "../../assets/pattern-furniture.jpg"
  }), /*#__PURE__*/React.createElement(Pinboard, {
    notes: NOTES,
    connections: STRINGS
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      animation: 'alta-slide-up var(--dur-slow) var(--ease-out) both'
    }
  }, /*#__PURE__*/React.createElement(TickerBand, null), /*#__PURE__*/React.createElement(Header, {
    page: page,
    onSelect: onSelect
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: '32px 64px'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-mono)',
      fontSize: 36
    }
  }, "House Hunt ends today at"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 'clamp(64px,9vw,128px)',
      letterSpacing: 'var(--tracking-hero)',
      lineHeight: 'var(--lh-tight)',
      animation: 'alta-wordmark-in var(--dur-hero) var(--ease-out) both'
    }
  }, "Alta Living"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '12px 0 0',
      maxWidth: '52ch',
      textAlign: 'center',
      fontSize: 18,
      lineHeight: 1.5,
      color: 'var(--ink-soft)'
    }
  }, "Fully serviced, fully furnished homes across Bangalore \u2014 for people who want to live somewhere, not just check in."), /*#__PURE__*/React.createElement(Button, {
    variant: "hard",
    size: "lg",
    shape: "pill",
    onClick: () => onSelect('Listings'),
    style: {
      margin: 32,
      width: '50%',
      height: 64,
      justifyContent: 'center'
    }
  }, "Browse Properties"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Tag, {
    tone: "outline",
    icon: "wifi"
  }, "Wi-Fi that works"), /*#__PURE__*/React.createElement(Tag, {
    tone: "outline",
    icon: "receipt"
  }, "No hidden fees"), /*#__PURE__*/React.createElement(Tag, {
    tone: "outline",
    icon: "phone"
  }, "A human on call")))));
}
function StatsBand() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 4fr 1fr',
      gap: 16,
      minHeight: 520
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1px solid var(--ink)',
      display: 'grid',
      gridTemplateRows: 'repeat(3,1fr)'
    }
  }, /*#__PURE__*/React.createElement(StatBlock, {
    value: "12+",
    label: "Properties and counting"
  }), /*#__PURE__*/React.createElement(StatBlock, {
    value: "5+",
    label: "Years of hosting"
  }), /*#__PURE__*/React.createElement(StatBlock, {
    value: "100+",
    label: "Happy Customers"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1px solid var(--ink)',
      overflow: 'hidden',
      position: 'relative',
      backgroundImage: 'linear-gradient(to bottom,var(--paper) 0%,transparent 40%,transparent 75%,var(--paper) 95%),url(../../assets/collage-bg.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 10
    }
  }, COLLAGE.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      position: 'absolute',
      left: c.x,
      top: c.y
    }
  }, /*#__PURE__*/React.createElement(PinnedPhoto, {
    src: '../../assets/homes/' + SHOTS[i % 3],
    seed: c.seed,
    width: c.width,
    height: c.height
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1px solid var(--ink)',
      display: 'grid',
      gridTemplateRows: '1fr 1fr 1fr'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderBottom: '1px solid var(--ink)',
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)'
    }
  }, "Avg. move-in"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 40,
      lineHeight: 1
    }
  }, "3 days")), /*#__PURE__*/React.createElement("div", {
    style: {
      borderBottom: '1px solid var(--ink)',
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)'
    }
  }, "Avg. stay"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 40,
      lineHeight: 1
    }
  }, "4 months")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      display: 'flex',
      alignItems: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)',
      lineHeight: 1.9
    }
  }, "Every home visited,", /*#__PURE__*/React.createElement("br", null), "measured and", /*#__PURE__*/React.createElement("br", null), "photographed by us.", /*#__PURE__*/React.createElement("br", null), "Bangalore \xB7 est. 2020")))));
}
function WhyAlta() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 32,
      marginTop: 88
    }
  }, /*#__PURE__*/React.createElement(ArchPanel, {
    title: "Renting a home shouldn't feel like a gamble",
    style: {
      borderColor: 'var(--paper-3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(FeatureCell, {
    icon: "sofa",
    title: "Actually furnished",
    tone: "blue"
  }, "Not furnished in listing-speak. Real kitchens, real wardrobes, Wi-Fi that works on day one."), /*#__PURE__*/React.createElement(FeatureCell, {
    icon: "search-check",
    title: "Personally vetted",
    tone: "sage"
  }, "Every home is visited and photographed by our own team. No stock photos, no surprises."), /*#__PURE__*/React.createElement(FeatureCell, {
    icon: "receipt",
    title: "No hidden fees",
    tone: "peach"
  }, "The rent you see includes cleaning, utilities and internet. What you see is what you pay."), /*#__PURE__*/React.createElement(FeatureCell, {
    icon: "phone",
    title: "A human on call",
    tone: "lilac"
  }, "One local point of contact for the length of your stay. Not a ticket queue, not a bot."))));
}
function HowItWorks() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 32,
      marginTop: 88
    }
  }, /*#__PURE__*/React.createElement(ArchPanel, {
    title: "Booking a home shouldn't take a manual",
    style: {
      borderColor: 'var(--paper-3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1px 1fr 1px 1fr',
      gap: 24,
      alignItems: 'stretch'
    }
  }, /*#__PURE__*/React.createElement(StepCell, {
    n: 1,
    title: "Browse"
  }, "Explore every live home by area, dates and size. Every photo is real, taken by us."), /*#__PURE__*/React.createElement(Rule, {
    orientation: "vertical",
    weight: "hard"
  }), /*#__PURE__*/React.createElement(StepCell, {
    n: 2,
    title: "Enquire"
  }, "Tell us your dates. One reply from a person, usually the same day \u2014 no host roulette."), /*#__PURE__*/React.createElement(Rule, {
    orientation: "vertical",
    weight: "hard"
  }), /*#__PURE__*/React.createElement(StepCell, {
    n: 3,
    title: "Move in"
  }, "Keys, Wi-Fi password and a local number the moment you arrive. Average: three days."))));
}
function Testimonials() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 32,
      marginTop: 88
    }
  }, /*#__PURE__*/React.createElement(ArchPanel, {
    title: "What people love about us",
    style: {
      borderColor: 'var(--paper-3)'
    },
    action: /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 'var(--tracking-label)',
        color: 'var(--text-muted)'
      }
    }, "4.9 average \xB7 100+ stays")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 24
    }
  }, QUOTES.map(q => /*#__PURE__*/React.createElement("div", {
    key: q.name,
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement(TestimonialCard, _extends({}, q, {
    location: q.location + ', Bangalore',
    style: {
      minWidth: 0,
      maxWidth: 'none'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 8,
      padding: '8px 2px',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "stayed ", q.stay), /*#__PURE__*/React.createElement("span", null, "verified")))))));
}
function Faq() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 32,
      marginTop: 88
    }
  }, /*#__PURE__*/React.createElement(ArchPanel, {
    title: "Questions, answered",
    style: {
      borderColor: 'var(--paper-3)'
    }
  }, /*#__PURE__*/React.createElement(Accordion, {
    items: FAQS,
    defaultOpen: 0
  })));
}
function Home({
  page,
  onSelect,
  onOpen
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Hero, {
    page: page,
    onSelect: onSelect
  }), /*#__PURE__*/React.createElement(StatsBand, null), /*#__PURE__*/React.createElement(WhyAlta, null), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 32,
      marginTop: 88
    }
  }, /*#__PURE__*/React.createElement(ArchPanel, {
    title: "Top Picks",
    style: {
      borderColor: 'var(--paper-3)'
    },
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "link",
      iconEnd: "arrow-right",
      onClick: () => onSelect('Listings')
    }, "Explore all homes")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 32
    }
  }, PICKS.map(p => /*#__PURE__*/React.createElement(PropertyCard, _extends({
    key: p.title
  }, p, {
    src: '../../assets/homes/' + p.src,
    unit: "per month",
    onView: () => onOpen && onOpen(p),
    style: {
      minWidth: 0
    }
  })))))), /*#__PURE__*/React.createElement(HowItWorks, null), /*#__PURE__*/React.createElement(Testimonials, null), /*#__PURE__*/React.createElement(Faq, null), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 88
    }
  }, /*#__PURE__*/React.createElement(CTABand, {
    title: "Your next home is a few clicks away",
    subtitle: "Real homes \xB7 real photos \xB7 zero surprises",
    onAction: () => onSelect('Listings')
  })), /*#__PURE__*/React.createElement(Footer, null));
}
Object.assign(window, {
  Home,
  PICKS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/Home.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/Listings.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  PropertyCard,
  ArchPanel,
  Button,
  Tag,
  Marquee
} = window.AltaLivingDesignSystem_f4d977;
const ALL = [{
  src: '1.jpg',
  title: 'The Garden Loft',
  hook: 'A quiet 2BHK above a courtyard, five minutes from 100ft Road.',
  location: 'Indiranagar, Bangalore',
  beds: '2BHK',
  availability: 'Available 1/3',
  price: '₹ 30,000'
}, {
  src: '2.jpg',
  title: 'The Studio on Vittal Mallya',
  hook: 'A minimalist one-bedroom built for long work stays.',
  location: 'Whitefield, Bangalore',
  beds: '1BHK',
  availability: 'Available 2/3',
  price: '₹ 24,000'
}, {
  src: '3.jpg',
  title: 'Courtyard House',
  hook: 'Three bedrooms around an open courtyard, ten minutes from the metro.',
  location: 'Jayanagar, Bangalore',
  beds: '3BHK',
  availability: 'Available 1/2',
  price: '₹ 42,000'
}, {
  src: '2.jpg',
  title: 'The Corner Flat',
  hook: 'Top-floor 1BHK with morning light on both sides.',
  location: 'HSR Layout, Bangalore',
  beds: '1BHK',
  availability: 'Available 1/1',
  price: '₹ 26,000'
}, {
  src: '3.jpg',
  title: 'The Long Stay',
  hook: 'Built for six-month stays: a real desk, a real kitchen, a real wardrobe.',
  location: 'Koramangala, Bangalore',
  beds: '2BHK',
  availability: 'Available 2/2',
  price: '₹ 34,000'
}, {
  src: '1.jpg',
  title: 'The Quiet Two',
  hook: 'A back-facing 2BHK on a street with no through traffic.',
  location: 'Basavanagudi, Bangalore',
  beds: '2BHK',
  availability: 'Available 1/2',
  price: '₹ 28,000'
}];
const FILTERS = ['All homes', '1BHK', '2BHK', '3BHK'];
function Listings({
  page,
  onSelect,
  onOpen
}) {
  const [filter, setFilter] = React.useState('All homes');
  const shown = filter === 'All homes' ? ALL : ALL.filter(p => p.beds === filter);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Marquee, {
    items: ["14 homes live across bangalore", "new listing — indiranagar 2bhk", "average move-in time — 3 days"]
  }), /*#__PURE__*/React.createElement(Header, {
    page: page,
    onSelect: onSelect
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 32,
      marginTop: 32
    }
  }, /*#__PURE__*/React.createElement(ArchPanel, {
    title: "Every home, right now",
    style: {
      borderColor: 'var(--paper-3)'
    },
    action: /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 'var(--tracking-label)',
        color: 'var(--text-muted)'
      }
    }, shown.length, " homes")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      flexWrap: 'wrap'
    }
  }, FILTERS.map(f => /*#__PURE__*/React.createElement(Button, {
    key: f,
    variant: filter === f ? 'hard-invert' : 'outline',
    size: "sm",
    onClick: () => setFilter(f)
  }, f))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 32
    }
  }, shown.map((p, i) => /*#__PURE__*/React.createElement(PropertyCard, _extends({
    key: p.title + i
  }, p, {
    src: '../../assets/homes/' + p.src,
    unit: "per month",
    tone: ['blue', 'sage', 'peach', 'lilac', 'butter'][i % 5],
    onView: () => onOpen && onOpen(p),
    style: {
      minWidth: 0
    }
  })))))), /*#__PURE__*/React.createElement(Footer, null));
}
Object.assign(window, {
  Listings
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/Listings.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/PropertyDrawer.jsx
try { (() => {
const {
  Button,
  Tag,
  Rule,
  Icon
} = window.AltaLivingDesignSystem_f4d977;

// The repo's src/pages/Property.tsx is an empty file — no property-detail design exists
// upstream. This drawer only re-presents data already designed on the listing card,
// and is marked as unspecified so nobody mistakes it for a real Alta screen.
function PropertyDrawer({
  property,
  onClose
}) {
  if (!property) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'flex',
      justifyContent: 'flex-end',
      background: 'rgba(17,17,17,.4)'
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("aside", {
    onClick: e => e.stopPropagation(),
    style: {
      width: 520,
      maxWidth: '92vw',
      background: 'var(--paper)',
      borderLeft: '1px solid var(--ink)',
      overflowY: 'auto',
      animation: 'alta-slide-up var(--dur-base) var(--ease-out) both'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: '../../assets/homes/' + property.src,
    alt: "",
    style: {
      width: '100%',
      height: 280,
      objectFit: 'cover',
      display: 'block',
      borderBottom: '1px solid var(--ink)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 38,
      lineHeight: 'var(--lh-tight)'
    }
  }, property.title), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    onClick: onClose,
    iconStart: "x"
  }, "Close")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--text-muted)',
      lineHeight: 1.6
    }
  }, property.hook), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Tag, {
    icon: "map-pin"
  }, property.location), /*#__PURE__*/React.createElement(Tag, {
    tone: "paper",
    icon: "bed"
  }, property.beds), /*#__PURE__*/React.createElement(Tag, {
    tone: "outline",
    icon: "door-open"
  }, property.availability)), /*#__PURE__*/React.createElement(Rule, {
    weight: "hard"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-price)'
    }
  }, property.price, " ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 400
    }
  }, "per month")), /*#__PURE__*/React.createElement(Button, {
    variant: "hard",
    block: true,
    iconEnd: "arrow-right"
  }, "Enquire about this home"), /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1px dashed var(--paper-3)',
      padding: 12,
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: '.14em',
      color: 'var(--text-muted)'
    }
  }, "Property detail page is unspecified upstream \u2014 left deliberately minimal."))));
}
Object.assign(window, {
  PropertyDrawer
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/PropertyDrawer.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Marquee = __ds_scope.Marquee;

__ds_ns.Pinboard = __ds_scope.Pinboard;

__ds_ns.PinnedPhoto = __ds_scope.PinnedPhoto;

__ds_ns.StickyNote = __ds_scope.StickyNote;

__ds_ns.Accordion = __ds_scope.Accordion;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.Rule = __ds_scope.Rule;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.ArchPanel = __ds_scope.ArchPanel;

__ds_ns.CTABand = __ds_scope.CTABand;

__ds_ns.NavCapsule = __ds_scope.NavCapsule;

__ds_ns.PatternField = __ds_scope.PatternField;

__ds_ns.Wordmark = __ds_scope.Wordmark;

__ds_ns.FeatureCell = __ds_scope.FeatureCell;

__ds_ns.PropertyCard = __ds_scope.PropertyCard;

__ds_ns.StatBlock = __ds_scope.StatBlock;

__ds_ns.StepCell = __ds_scope.StepCell;

__ds_ns.TestimonialCard = __ds_scope.TestimonialCard;

})();
