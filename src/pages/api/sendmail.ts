import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import hbs, {
  NodemailerExpressHandlebarsOptions,
} from "nodemailer-express-handlebars";
import path from "path";

type Data = {
  nombres?: string;
  message?: string;
  email?: any;
  ok?: boolean;
  nro_seguimiento?: string;
  info?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    // Uso de metodo POST para envio de email
    if (req.method !== "POST") {
      return res.status(405).json({
        message: "Only POST requests allowed",
      });
    }

    // Datos extraidos del formulario para el envio de Email
    const { email, nro_seguimiento, nombres } = JSON.parse(JSON.stringify(req.body));

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NEXT_PUBLIC_EMAIL_ADDRESS,
        pass: process.env.NEXT_PUBLIC_PASSWORD,
      },
      ignoreTLS: false,
    });

    // Direccionamiento a la carpeta que contiene la plantilla .handlebars
    const handlebarOptions: NodemailerExpressHandlebarsOptions = {
      viewEngine: {
        partialsDir: path.resolve("./public/"),
        defaultLayout: false,
      },
      viewPath: path.resolve("./public/"),
    };

    // Uso de plantilla con nodemailer
    transporter.use("compile", hbs(handlebarOptions));

    const mailOptions = {
      from: '"Nofificaciones de Reclamos" <cquesr175@gmail.com>', // Correo remitente
      to: `${email}`, // Correo destinatario
      subject: `RECLAMO #${nro_seguimiento}`,
      template: "email", // Nombre del template handlebars ubicado en la carpeta public
      context: {
        name: `${nombres}`, // Nombre de la empresa
        code: `${nro_seguimiento}`, // Numero de reclamo
      },
    };

    // Trigger del envio del Email
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return res.status(400).json({
          message: "MENSAJE NO ENVIADO",
          info: error
        })

      }
      return res.status(200).json({
        message: "MENSAJE ENVIADO",
        info: info.response
      })
    });

  } catch (error) {
    // Mensaje de error - falla de servidor
    return res.status(500).json({
      message: "Internal Server error",
      ok: false,
    });
  }
}
