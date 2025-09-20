

const verifyEmailTemplate = ({name,url}) => {
  return `
  <p>Dear ${name}</p>
  <P>Thank you for registering in Freshify.</p>
  <a href=${url} style ="color:white;background:blue; margin-top:10px"> verify Email<a>`



}

export default verifyEmailTemplate