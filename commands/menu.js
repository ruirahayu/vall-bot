module.exports = async (sock, m, args, sender, from) => {
  const menuText = `*List Commands:*

.add
.kick
.antilink open/close
.antidelete on/off
.demote
.promote
.group on/off
.groupinfo
.hidetag
.kickall (remove all member)
.owner
.poll (polling)
.setdesc
.setwelcome
.setgoodbye
.setname
.sticker (foto to stiker)
.tagall (tag smuua member gc)
.setrules
.rules 
.say (text to audio)
.lirik 
.qc (quote)
.confess

Ketik command dengan prefix "." ya!`;

  await sock.sendMessage(from, { text: menuText });
};
