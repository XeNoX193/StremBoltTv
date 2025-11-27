import React from 'react';

//Componente Footer
export default function Footer() {
    return (
        <footer className="footer" role="contentinfo" aria-label="Footer information">
            <h2 className="visually-hidden">Footer Information</h2>
            <div className="footer__container">
                <div className="footer__brand">
                    <span className="footer__logo">StreamBolt TV</span>
                    <span className="footer__owners">by Carlos Freitas &amp; Ângelo Teresa</span>
                </div>
                <div className="footer__contacts">
                    <span className="footer__contacts-title">Contacts:</span>
                    <a href="mailto:25959@stu.ipbeja.pt" className="footer__contact-link">25959@stu.ipbeja.pt</a>
                    <a href="mailto:25441@stu.ipbeja.pt" className="footer__contact-link">25441@stu.ipbeja.pt</a>
                </div>
            </div>
            <div className="footer__copyright">
                &copy; {new Date().getFullYear()} StreamBolt TV. All rights reserved.
            </div>
        </footer>
    );
}